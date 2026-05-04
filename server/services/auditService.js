const mongoose = require("mongoose");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");
const ChainOfCustody = require("../models/ChainOfCustody");
const AnalysisReport = require("../models/AnalysisReport");
const EventLog = require("../models/EventLog");
const AppError = require("../utils/AppError");

function ensureObjectId(value, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
}

async function getAccessibleCase(caseId, user) {
  ensureObjectId(caseId, "caseId");

  const caseRecord = await Case.findOne({ _id: caseId, isDeleted: false })
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .lean();

  if (!caseRecord) {
    throw new AppError("Case not found.", 404);
  }

  const actorId = String(user.userId || user._id);
  const hasAccess =
    user.role === "ADMIN" ||
    String(caseRecord.createdBy?._id || caseRecord.createdBy) === actorId ||
    String(caseRecord.assignedTo?._id || caseRecord.assignedTo) === actorId;

  if (!hasAccess) {
    throw new AppError("Forbidden: you are not authorized to access this case.", 403);
  }

  return caseRecord;
}

async function getAccessibleEvidence(evidenceId, user) {
  ensureObjectId(evidenceId, "evidenceId");

  const evidence = await Evidence.findOne({ _id: evidenceId, isDeleted: false }).lean();
  if (!evidence) {
    throw new AppError("Evidence not found.", 404);
  }

  await getAccessibleCase(evidence.caseId, user);
  return evidence;
}

function normalizeCustodyRecord(record) {
  return {
    action: record.action,
    performedBy: record.performedBy
      ? {
          id: record.performedBy._id,
          name: record.performedBy.name,
          email: record.performedBy.email,
          role: record.performedBy.role,
        }
      : null,
    timestamp: record.timestamp,
    notes: record.notes,
  };
}

function buildReadableDescription(eventType, metadata = {}) {
  const messageMap = {
    CASE_CREATED: `Case created${metadata.title ? `: ${metadata.title}` : ""}`,
    CASE_UPDATED: `Case updated${metadata.title ? `: ${metadata.title}` : ""}`,
    CASE_STATUS_CHANGED: `Case status changed from ${metadata.previousStatus || "unknown"} to ${metadata.currentStatus || "unknown"}`,
    CASE_ASSIGNED: `Case assigned${metadata.assignedToName ? ` to ${metadata.assignedToName}` : ""}`,
    CASE_DELETED: "Case deleted",
    EVIDENCE_UPLOADED: `Evidence uploaded${metadata.fileName ? `: ${metadata.fileName}` : ""}`,
    EVIDENCE_VERIFIED: `Evidence verification ${metadata.verified === false ? "failed" : "completed"}`,
    EVIDENCE_DELETED: "Evidence deleted",
    ANALYSIS_COMPLETED: `Analysis completed${metadata.aiModelUsed ? ` using ${metadata.aiModelUsed}` : ""}`,
    BLOCKCHAIN_STORED: "Evidence hash stored on blockchain",
    BLOCKCHAIN_VERIFIED: `Blockchain verification ${metadata.verified ? "succeeded" : "failed"}`,
    TIMELINE_GENERATED: "Case timeline generated",
    SIMILAR_CASES_FOUND: "Similar case analysis completed",
    USER_REGISTERED: "User registered",
    USER_LOGGED_IN: "User logged in",
  };

  return messageMap[eventType] || eventType.replace(/_/g, " ").toLowerCase();
}

async function getEvidenceChainOfCustody(evidenceId, user) {
  const evidence = await getAccessibleEvidence(evidenceId, user);

  const records = await ChainOfCustody.find({ evidenceId: evidence._id })
    .populate("performedBy", "name email role")
    .sort({ timestamp: 1 })
    .lean();

  return records.map(normalizeCustodyRecord);
}

async function getCaseAuditTrail(caseId, user) {
  const caseRecord = await getAccessibleCase(caseId, user);
  const evidence = await Evidence.find({ caseId: caseRecord._id, isDeleted: false })
    .select("_id fileName")
    .lean();
  const evidenceIds = evidence.map((item) => item._id);
  const evidenceMap = new Map(evidence.map((item) => [String(item._id), item.fileName]));

  const [eventLogs, custodyLogs, analysisReports] = await Promise.all([
    EventLog.find({
      $or: [
        { entityType: "Case", entityId: caseRecord._id },
        { entityType: "Evidence", entityId: { $in: evidenceIds } },
      ],
    })
      .populate("performedBy", "name email role")
      .sort({ createdAt: 1 })
      .lean(),
    ChainOfCustody.find({ evidenceId: { $in: evidenceIds } })
      .populate("performedBy", "name email role")
      .sort({ timestamp: 1 })
      .lean(),
    AnalysisReport.find({ caseId: caseRecord._id })
      .populate("evidenceId", "fileName")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const normalizedEvents = eventLogs.map((entry) => ({
    timestamp: entry.createdAt,
    eventType: entry.eventType,
    description: buildReadableDescription(entry.eventType, entry.metadata),
    performedBy: entry.performedBy
      ? {
          id: entry.performedBy._id,
          name: entry.performedBy.name,
          email: entry.performedBy.email,
          role: entry.performedBy.role,
        }
      : null,
  }));

  const normalizedCustody = custodyLogs.map((entry) => ({
    timestamp: entry.timestamp,
    eventType: `CHAIN_OF_CUSTODY_${String(entry.action).toUpperCase()}`,
    description: `Evidence ${entry.action}${evidenceMap.get(String(entry.evidenceId)) ? `: ${evidenceMap.get(String(entry.evidenceId))}` : ""}`,
    performedBy: entry.performedBy
      ? {
          id: entry.performedBy._id,
          name: entry.performedBy.name,
          email: entry.performedBy.email,
          role: entry.performedBy.role,
        }
      : null,
  }));

  const normalizedAnalysis = analysisReports.map((entry) => ({
    timestamp: entry.createdAt,
    eventType: "ANALYSIS_REPORT_CREATED",
    description: `Analysis report created${entry.evidenceId?.fileName ? ` for ${entry.evidenceId.fileName}` : ""} with risk score ${entry.riskScore}`,
    performedBy: null,
  }));

  return [...normalizedEvents, ...normalizedCustody, ...normalizedAnalysis].sort(
    (left, right) => new Date(left.timestamp) - new Date(right.timestamp),
  );
}

async function getUserActivityLogs(userId, requester) {
  ensureObjectId(userId, "userId");

  const requesterId = String(requester.userId || requester._id);
  if (requester.role !== "ADMIN" && requesterId !== String(userId)) {
    throw new AppError("Forbidden: you are not authorized to view this user activity.", 403);
  }

  const [eventLogs, custodyLogs] = await Promise.all([
    EventLog.find({ performedBy: userId }).sort({ createdAt: 1 }).lean(),
    ChainOfCustody.find({ performedBy: userId })
      .populate("evidenceId", "fileName caseId")
      .sort({ timestamp: 1 })
      .lean(),
  ]);

  const normalizedEvents = eventLogs.map((entry) => ({
    timestamp: entry.createdAt,
    eventType: entry.eventType,
    description: buildReadableDescription(entry.eventType, entry.metadata),
    source: "eventLog",
  }));

  const normalizedCustody = custodyLogs.map((entry) => ({
    timestamp: entry.timestamp,
    eventType: `CHAIN_OF_CUSTODY_${String(entry.action).toUpperCase()}`,
    description: `Evidence ${entry.action}${entry.evidenceId?.fileName ? `: ${entry.evidenceId.fileName}` : ""}`,
    source: "chainOfCustody",
  }));

  return [...normalizedEvents, ...normalizedCustody].sort(
    (left, right) => new Date(left.timestamp) - new Date(right.timestamp),
  );
}

function toCsv(rows) {
  const header = ["timestamp", "eventType", "description", "performedByName", "performedByEmail", "performedByRole"];
  const csvRows = rows.map((row) =>
    [
      row.timestamp,
      row.eventType,
      row.description,
      row.performedBy?.name || "",
      row.performedBy?.email || "",
      row.performedBy?.role || "",
    ]
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );

  return [header.join(","), ...csvRows].join("\n");
}

async function exportCaseAuditLogs(caseId, user, format = "json") {
  const caseRecord = await getAccessibleCase(caseId, user);
  const [evidence, timeline, chainOfCustody] = await Promise.all([
    Evidence.find({ caseId: caseRecord._id, isDeleted: false })
      .select("_id fileName fileType fileSize hash uploadedBy createdAt")
      .populate("uploadedBy", "name email role")
      .lean(),
    getCaseAuditTrail(caseRecord._id, user),
    ChainOfCustody.find({
      evidenceId: {
        $in: await Evidence.find({ caseId: caseRecord._id, isDeleted: false }).distinct("_id"),
      },
    })
      .populate("performedBy", "name email role")
      .populate("evidenceId", "fileName")
      .sort({ timestamp: 1 })
      .lean(),
  ]);

  const payload = {
    case: {
      id: caseRecord._id,
      title: caseRecord.title,
      description: caseRecord.description,
      status: caseRecord.status,
      priority: caseRecord.priority,
      createdBy: caseRecord.createdBy,
      assignedTo: caseRecord.assignedTo,
      createdAt: caseRecord.createdAt,
      updatedAt: caseRecord.updatedAt,
    },
    evidence,
    timeline,
    chainOfCustody: chainOfCustody.map((entry) => ({
      evidence: entry.evidenceId?.fileName || null,
      action: entry.action,
      performedBy: entry.performedBy
        ? {
            id: entry.performedBy._id,
            name: entry.performedBy.name,
            email: entry.performedBy.email,
            role: entry.performedBy.role,
          }
        : null,
      timestamp: entry.timestamp,
      notes: entry.notes,
    })),
  };

  if (String(format).toLowerCase() === "csv") {
    return {
      format: "csv",
      content: toCsv(timeline),
      fileName: `case-${caseRecord._id}-audit.csv`,
    };
  }

  return {
    format: "json",
    content: payload,
    fileName: `case-${caseRecord._id}-audit.json`,
  };
}

module.exports = {
  getEvidenceChainOfCustody,
  getCaseAuditTrail,
  getUserActivityLogs,
  exportCaseAuditLogs,
};
