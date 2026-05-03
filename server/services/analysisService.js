const fs = require("fs");
const mongoose = require("mongoose");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");
const AnalysisReport = require("../models/AnalysisReport");
const ChainOfCustody = require("../models/ChainOfCustody");
const EventLog = require("../models/EventLog");
const AppError = require("../utils/AppError");
const { analyzeText, analyzeLog, analyzeImage } = require("../utils/aiClient");

function ensureObjectId(value, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
}

async function getAccessibleEvidence(evidenceId, user) {
  ensureObjectId(evidenceId, "evidenceId");

  const evidence = await Evidence.findOne({ _id: evidenceId, isDeleted: false }).populate("uploadedBy", "name email role");
  if (!evidence) {
    throw new AppError("Evidence not found.", 404);
  }

  const caseRecord = await Case.findOne({ _id: evidence.caseId, isDeleted: false });
  if (!caseRecord) {
    throw new AppError("Associated case not found.", 404);
  }

  const actorId = String(user.userId || user._id);
  const hasAccess =
    user.role === "Admin" ||
    String(caseRecord.createdBy) === actorId ||
    String(caseRecord.assignedTo) === actorId;

  if (!hasAccess) {
    throw new AppError("Forbidden: you are not authorized to analyze this evidence.", 403);
  }

  return { evidence, caseRecord };
}

async function getAccessibleCase(caseId, user) {
  ensureObjectId(caseId, "caseId");

  const caseRecord = await Case.findOne({ _id: caseId, isDeleted: false });
  if (!caseRecord) {
    throw new AppError("Case not found.", 404);
  }

  const actorId = String(user.userId || user._id);
  const hasAccess =
    user.role === "Admin" ||
    String(caseRecord.createdBy) === actorId ||
    String(caseRecord.assignedTo) === actorId;

  if (!hasAccess) {
    throw new AppError("Forbidden: you are not authorized to access this case.", 403);
  }

  return caseRecord;
}

async function logAnalysisCustody(evidenceId, performedBy, notes) {
  await ChainOfCustody.create({
    evidenceId,
    action: "analyze",
    performedBy,
    timestamp: new Date(),
    notes,
  });
}

async function logAnalysisEvent(evidenceId, performedBy, metadata) {
  await EventLog.create({
    eventType: "ANALYSIS_COMPLETED",
    entityType: "Evidence",
    entityId: evidenceId,
    performedBy,
    metadata,
  });
}

async function runEvidenceAnalysis(evidenceId, user) {
  const { evidence, caseRecord } = await getAccessibleEvidence(evidenceId, user);

  if (!fs.existsSync(evidence.filePath)) {
    throw new AppError("Evidence file is missing from disk.", 500);
  }

  const actorId = user.userId || user._id;
  let aiResult;
  let aiModelUsed;

  try {
    if (evidence.fileType === "image") {
      aiResult = await analyzeImage(evidence.filePath);
      aiModelUsed = "opencv-ssim-tamper-detector";
    } else {
      const fileContent = await fs.promises.readFile(evidence.filePath, "utf-8");

      if (evidence.fileType === "log") {
        aiResult = await analyzeLog(fileContent);
        aiModelUsed = "isolation-forest-log-analyzer";
      } else {
        aiResult = await analyzeText(fileContent);
        aiModelUsed = "nltk-text-risk-analyzer";
      }
    }
  } catch (error) {
    if (error.response) {
      throw new AppError("AI service returned an error during analysis.", 502, error.response.data);
    }

    throw new AppError("AI service is unavailable.", 503, { reason: error.message });
  }

  const reportPayload = {
    evidenceId: evidence._id,
    caseId: caseRecord._id,
    riskScore: aiResult.riskScore ?? (aiResult.tampered ? 75 : 15),
    threatsDetected: aiResult.threatsDetected || (aiResult.anomaliesDetected ? ["anomalous_log_activity"] : []),
    aiModelUsed,
    explanation: aiResult.explanation || "AI analysis completed.",
    rawOutput: aiResult,
  };

  const report = await AnalysisReport.create(reportPayload);

  await logAnalysisCustody(
    evidence._id,
    actorId,
    `Evidence analyzed through AI pipeline using ${aiModelUsed}.`,
  );

  await logAnalysisEvent(evidence._id, actorId, {
    caseId: caseRecord._id,
    reportId: report._id,
    riskScore: report.riskScore,
    aiModelUsed,
  });

  return AnalysisReport.findById(report._id)
    .populate("evidenceId", "fileName fileType hash")
    .populate("caseId", "title status priority");
}

async function getAnalysisReport(evidenceId, user) {
  const { evidence } = await getAccessibleEvidence(evidenceId, user);

  const reports = await AnalysisReport.find({ evidenceId: evidence._id })
    .populate("evidenceId", "fileName fileType hash")
    .populate("caseId", "title status priority")
    .sort({ createdAt: -1 })
    .lean();

  return reports;
}

async function getCaseAnalysisReports(caseId, user) {
  await getAccessibleCase(caseId, user);

  const reports = await AnalysisReport.find({ caseId })
    .populate("evidenceId", "fileName fileType hash")
    .populate("caseId", "title status priority")
    .sort({ createdAt: -1 })
    .lean();

  return reports;
}

module.exports = {
  runEvidenceAnalysis,
  getAnalysisReport,
  getCaseAnalysisReports,
};
