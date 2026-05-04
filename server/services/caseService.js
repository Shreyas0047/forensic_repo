const mongoose = require("mongoose");
const Case = require("../models/Case");
const User = require("../models/User");
const Evidence = require("../models/Evidence");
const AnalysisReport = require("../models/AnalysisReport");
const BlockchainRecord = require("../models/BlockchainRecord");
const ChainOfCustody = require("../models/ChainOfCustody");
const EventLog = require("../models/EventLog");
const AppError = require("../utils/AppError");

const ALLOWED_STATUS_TRANSITIONS = {
  pending: ["in-progress"],
  "in-progress": ["closed"],
  closed: [],
};

function ensureObjectId(value, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
}

function buildCaseScope(user) {
  if (user.role === "ADMIN") {
    return { isDeleted: false };
  }

  return {
    isDeleted: false,
    $or: [{ createdBy: user.userId || user._id }, { assignedTo: user.userId || user._id }],
  };
}

async function logCaseEvent({ eventType, caseId, performedBy, metadata = {} }) {
  await EventLog.create({
    eventType,
    entityType: "Case",
    entityId: caseId,
    performedBy,
    metadata,
  });
}

async function getCaseOrThrow(caseId) {
  ensureObjectId(caseId, "case id");
  const caseRecord = await Case.findOne({ _id: caseId, isDeleted: false });

  if (!caseRecord) {
    throw new AppError("Case not found.", 404);
  }

  return caseRecord;
}

function canAccessCase(user, caseRecord) {
  if (user.role === "ADMIN") {
    return true;
  }

  const actorId = String(user.userId || user._id);
  return String(caseRecord.createdBy) === actorId || String(caseRecord.assignedTo) === actorId;
}

async function createCase(payload, user) {
  const createdCase = await Case.create({
    title: payload.title,
    description: payload.description || "",
    priority: payload.priority || "medium",
    tags: payload.tags || [],
    status: "pending",
    createdBy: user.userId || user._id,
  });

  await logCaseEvent({
    eventType: "CASE_CREATED",
    caseId: createdCase._id,
    performedBy: user.userId || user._id,
    metadata: {
      title: createdCase.title,
      priority: createdCase.priority,
      tags: createdCase.tags,
    },
  });

  return Case.findById(createdCase._id).populate("createdBy", "name email role").populate("assignedTo", "name email role");
}

async function getAllCases(query, user) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filters = buildCaseScope(user);

  if (query.status) {
    filters.status = query.status;
  }
  if (query.priority) {
    filters.priority = query.priority;
  }
  if (query.createdBy) {
    ensureObjectId(query.createdBy, "createdBy");
    filters.createdBy = query.createdBy;
  }
  if (query.assignedTo) {
    ensureObjectId(query.assignedTo, "assignedTo");
    filters.assignedTo = query.assignedTo;
  }

  const [cases, total] = await Promise.all([
    Case.find(filters)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Case.countDocuments(filters),
  ]);

  return {
    cases,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getSingleCase(caseId, user) {
  const caseRecord = await Case.findOne({ _id: caseId, isDeleted: false })
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");

  if (!caseRecord) {
    throw new AppError("Case not found.", 404);
  }

  if (!canAccessCase(user, caseRecord)) {
    throw new AppError("Forbidden: you do not have access to this case.", 403);
  }

  const evidence = await Evidence.find({ caseId: caseRecord._id })
    .populate("uploadedBy", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  const evidenceIds = evidence.map((item) => item._id);

  const [analysisReports, blockchainRecords, chainOfCustodyLogs] = await Promise.all([
    AnalysisReport.find({ caseId: caseRecord._id })
      .populate("evidenceId", "fileName hash fileType")
      .sort({ createdAt: -1 })
      .lean(),
    BlockchainRecord.find({ evidenceId: { $in: evidenceIds } })
      .populate("evidenceId", "fileName hash")
      .sort({ createdAt: -1 })
      .lean(),
    ChainOfCustody.find({ evidenceId: { $in: evidenceIds } })
      .populate("evidenceId", "fileName hash")
      .populate("performedBy", "name email role")
      .sort({ timestamp: 1 })
      .lean(),
  ]);

  return {
    case: caseRecord.toObject(),
    evidence,
    analysisReports,
    blockchainRecords,
    chainOfCustodyLogs,
  };
}

async function updateCase(caseId, payload, user) {
  const caseRecord = await getCaseOrThrow(caseId);
  const actorId = String(user.userId || user._id);

  if (user.role !== "ADMIN" && String(caseRecord.createdBy) !== actorId) {
    throw new AppError("Forbidden: only the case creator or Admin can update this case.", 403);
  }

  caseRecord.title = payload.title ?? caseRecord.title;
  caseRecord.description = payload.description ?? caseRecord.description;
  caseRecord.priority = payload.priority ?? caseRecord.priority;
  caseRecord.tags = payload.tags ?? caseRecord.tags;
  await caseRecord.save();

  await logCaseEvent({
    eventType: "CASE_UPDATED",
    caseId: caseRecord._id,
    performedBy: actorId,
    metadata: {
      title: caseRecord.title,
      priority: caseRecord.priority,
      tags: caseRecord.tags,
    },
  });

  return Case.findById(caseRecord._id).populate("createdBy", "name email role").populate("assignedTo", "name email role");
}

async function updateCaseStatus(caseId, status, user) {
  const caseRecord = await getCaseOrThrow(caseId);
  const actorId = String(user.userId || user._id);

  if (user.role !== "ADMIN" && String(caseRecord.assignedTo) !== actorId) {
    throw new AppError("Forbidden: only the assigned investigator or Admin can change case status.", 403);
  }

  const nextStatuses = ALLOWED_STATUS_TRANSITIONS[caseRecord.status] || [];
  if (!nextStatuses.includes(status)) {
    throw new AppError(`Invalid status transition from ${caseRecord.status} to ${status}.`, 400);
  }

  const previousStatus = caseRecord.status;
  caseRecord.status = status;
  await caseRecord.save();

  await logCaseEvent({
    eventType: "CASE_STATUS_CHANGED",
    caseId: caseRecord._id,
    performedBy: actorId,
    metadata: {
      previousStatus,
      currentStatus: status,
    },
  });

  return caseRecord;
}

async function assignCase(caseId, assignedTo, user) {
  ensureObjectId(assignedTo, "assignedTo");

  const assignee = await User.findById(assignedTo);
  if (!assignee || assignee.role !== "INVESTIGATOR") {
    throw new AppError("Assigned user must be a valid INVESTIGATOR.", 400);
  }

  const caseRecord = await getCaseOrThrow(caseId);
  caseRecord.assignedTo = assignedTo;
  if (caseRecord.status === "pending") {
    caseRecord.status = "in-progress";
  }
  await caseRecord.save();

  await logCaseEvent({
    eventType: "CASE_ASSIGNED",
    caseId: caseRecord._id,
    performedBy: user.userId || user._id,
    metadata: {
      assignedTo: assignee._id,
      assignedToEmail: assignee.email,
      assignedToName: assignee.name,
    },
  });

  return Case.findById(caseRecord._id).populate("createdBy", "name email role").populate("assignedTo", "name email role");
}

async function deleteCase(caseId, user) {
  const caseRecord = await getCaseOrThrow(caseId);
  caseRecord.isDeleted = true;
  caseRecord.deletedAt = new Date();
  await caseRecord.save();

  await logCaseEvent({
    eventType: "CASE_DELETED",
    caseId: caseRecord._id,
    performedBy: user.userId || user._id,
    metadata: {
      deletedAt: caseRecord.deletedAt,
    },
  });

  return {
    id: caseRecord._id,
    isDeleted: caseRecord.isDeleted,
    deletedAt: caseRecord.deletedAt,
  };
}

module.exports = {
  createCase,
  getAllCases,
  getSingleCase,
  updateCase,
  updateCaseStatus,
  assignCase,
  deleteCase,
};
