const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");
const ChainOfCustody = require("../models/ChainOfCustody");
const BlockchainRecord = require("../models/BlockchainRecord");
const EventLog = require("../models/EventLog");
const AppError = require("../utils/AppError");
const { generateFileHash } = require("../utils/hashUtils");

const UPLOADS_ROOT = path.resolve(__dirname, "..", "uploads");

function ensureObjectId(value, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
}

function resolveEvidenceType(mimeType) {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType === "text/plain") {
    return "text";
  }

  if (mimeType === "application/json") {
    return "log";
  }

  return "other";
}

function getSafeRelativePath(absolutePath) {
  const normalizedPath = path.resolve(absolutePath);
  if (!normalizedPath.startsWith(UPLOADS_ROOT)) {
    throw new AppError("Unsafe evidence file path detected.", 500);
  }

  return path.relative(UPLOADS_ROOT, normalizedPath).replace(/\\/g, "/");
}

async function logCustody({ evidenceId, action, performedBy, notes = "" }) {
  await ChainOfCustody.create({
    evidenceId,
    action,
    performedBy,
    timestamp: new Date(),
    notes,
  });
}

async function logEvidenceEvent({ eventType, evidenceId, performedBy, metadata = {} }) {
  await EventLog.create({
    eventType,
    entityType: "Evidence",
    entityId: evidenceId,
    performedBy,
    metadata,
  });
}

async function getAccessibleCase(caseId, user) {
  ensureObjectId(caseId, "caseId");

  const caseRecord = await Case.findOne({ _id: caseId, isDeleted: false });
  if (!caseRecord) {
    throw new AppError("Case not found.", 404);
  }

  const actorId = String(user.userId || user._id);
  const isAuthorized =
    user.role === "Admin" ||
    String(caseRecord.createdBy) === actorId ||
    String(caseRecord.assignedTo) === actorId;

  if (!isAuthorized) {
    throw new AppError("Forbidden: you are not authorized to access evidence for this case.", 403);
  }

  return caseRecord;
}

async function getEvidenceOrThrow(evidenceId) {
  ensureObjectId(evidenceId, "evidence id");

  const evidence = await Evidence.findOne({ _id: evidenceId, isDeleted: false });
  if (!evidence) {
    throw new AppError("Evidence not found.", 404);
  }

  return evidence;
}

async function assertEvidenceAccess(evidenceId, user) {
  const evidence = await getEvidenceOrThrow(evidenceId);
  const caseRecord = await getAccessibleCase(evidence.caseId, user);
  return { evidence, caseRecord };
}

async function uploadEvidence({ caseId, file, user }) {
  const actorId = user.userId || user._id;
  await getAccessibleCase(caseId, user);

  const absolutePath = path.resolve(file.path);
  if (!absolutePath.startsWith(UPLOADS_ROOT)) {
    throw new AppError("Unsafe upload path detected.", 500);
  }

  const hash = await generateFileHash(absolutePath);
  const evidence = await Evidence.create({
    caseId,
    fileName: file.originalname,
    storageName: file.filename,
    filePath: absolutePath,
    mimeType: file.mimetype,
    fileType: resolveEvidenceType(file.mimetype),
    fileSize: file.size,
    hash,
    uploadedBy: actorId,
    metadata: {
      relativePath: getSafeRelativePath(absolutePath),
    },
  });

  await logCustody({
    evidenceId: evidence._id,
    action: "upload",
    performedBy: actorId,
    notes: "Evidence uploaded to secure storage.",
  });

  await logEvidenceEvent({
    eventType: "EVIDENCE_UPLOADED",
    evidenceId: evidence._id,
    performedBy: actorId,
    metadata: {
      caseId,
      fileName: evidence.fileName,
      fileType: evidence.fileType,
      fileSize: evidence.fileSize,
      hash: evidence.hash,
    },
  });

  return {
    id: evidence._id,
    caseId: evidence.caseId,
    fileName: evidence.fileName,
    fileType: evidence.fileType,
    fileSize: evidence.fileSize,
    hash: evidence.hash,
    uploadedBy: evidence.uploadedBy,
    createdAt: evidence.createdAt,
  };
}

async function getEvidenceByCase(caseId, user) {
  await getAccessibleCase(caseId, user);

  const evidence = await Evidence.find({ caseId, isDeleted: false })
    .select("-filePath -storageName")
    .populate("uploadedBy", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return evidence;
}

async function getSingleEvidence(evidenceId, user) {
  const { evidence } = await assertEvidenceAccess(evidenceId, user);

  await logCustody({
    evidenceId: evidence._id,
    action: "access",
    performedBy: user.userId || user._id,
    notes: "Evidence metadata accessed.",
  });

  const [evidenceRecord, chainOfCustody, blockchainRecord] = await Promise.all([
    Evidence.findById(evidence._id).select("-filePath -storageName").populate("uploadedBy", "name email role").lean(),
    ChainOfCustody.find({ evidenceId: evidence._id })
      .populate("performedBy", "name email role")
      .sort({ timestamp: 1 })
      .lean(),
    BlockchainRecord.findOne({ evidenceId: evidence._id }).lean(),
  ]);

  return {
    evidence: evidenceRecord,
    chainOfCustody,
    blockchainRecord,
  };
}

async function verifyEvidence(evidenceId, user) {
  const { evidence } = await assertEvidenceAccess(evidenceId, user);

  if (!fs.existsSync(evidence.filePath)) {
    throw new AppError("Stored evidence artifact is missing from disk.", 500);
  }

  const recalculatedHash = await generateFileHash(evidence.filePath);
  const verified = recalculatedHash === evidence.hash;

  evidence.isTampered = !verified;
  await evidence.save();

  await logCustody({
    evidenceId: evidence._id,
    action: "verify",
    performedBy: user.userId || user._id,
    notes: verified ? "Evidence integrity verified successfully." : "Evidence integrity verification failed.",
  });

  await logEvidenceEvent({
    eventType: "EVIDENCE_VERIFIED",
    evidenceId: evidence._id,
    performedBy: user.userId || user._id,
    metadata: {
      verified,
      originalHash: evidence.hash,
      recalculatedHash,
      isTampered: evidence.isTampered,
    },
  });

  return {
    evidenceId: evidence._id,
    verified,
    originalHash: evidence.hash,
    recalculatedHash,
    isTampered: evidence.isTampered,
  };
}

async function deleteEvidence(evidenceId, user) {
  const evidence = await getEvidenceOrThrow(evidenceId);

  evidence.isDeleted = true;
  evidence.deletedAt = new Date();
  await evidence.save();

  await logEvidenceEvent({
    eventType: "EVIDENCE_DELETED",
    evidenceId: evidence._id,
    performedBy: user.userId || user._id,
    metadata: {
      deletedAt: evidence.deletedAt,
      caseId: evidence.caseId,
    },
  });

  return {
    id: evidence._id,
    isDeleted: evidence.isDeleted,
    deletedAt: evidence.deletedAt,
  };
}

module.exports = {
  uploadEvidence,
  getEvidenceByCase,
  getSingleEvidence,
  verifyEvidence,
  deleteEvidence,
};
