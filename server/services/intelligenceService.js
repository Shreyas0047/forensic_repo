const mongoose = require("mongoose");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");
const ChainOfCustody = require("../models/ChainOfCustody");
const AnalysisReport = require("../models/AnalysisReport");
const EventLog = require("../models/EventLog");
const AppError = require("../utils/AppError");
const { vectorizeText, cosineSimilarity } = require("../utils/similarityUtils");

function ensureObjectId(value, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
}

async function getAccessibleCase(caseId, user) {
  ensureObjectId(caseId, "caseId");

  const caseRecord = await Case.findOne({ _id: caseId, isDeleted: false })
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");

  if (!caseRecord) {
    throw new AppError("Case not found.", 404);
  }

  const actorId = String(user.userId || user._id);
  const hasAccess =
    user.role === "Admin" ||
    String(caseRecord.createdBy?._id || caseRecord.createdBy) === actorId ||
    String(caseRecord.assignedTo?._id || caseRecord.assignedTo) === actorId;

  if (!hasAccess) {
    throw new AppError("Forbidden: you are not authorized to access this case.", 403);
  }

  return caseRecord;
}

async function recordIntelligenceCustody(evidenceIds, performedBy, notes) {
  if (!evidenceIds.length) {
    return;
  }

  const timestamp = new Date();
  await ChainOfCustody.insertMany(
    evidenceIds.map((evidenceId) => ({
      evidenceId,
      action: "analyze",
      performedBy,
      timestamp,
      notes,
    })),
  );
}

async function logIntelligenceEvent(eventType, caseId, performedBy, metadata = {}) {
  await EventLog.create({
    eventType,
    entityType: "Case",
    entityId: caseId,
    performedBy,
    metadata,
  });
}

function buildTimelineEntries({ evidence, custodyLogs, analysisReports }) {
  const evidenceMap = new Map(evidence.map((item) => [String(item._id), item]));

  const evidenceEvents = evidence.map((item) => ({
    timestamp: item.createdAt,
    eventType: "EVIDENCE_UPLOADED",
    description: `Evidence uploaded: ${item.fileName}`,
  }));

  const custodyEvents = custodyLogs.map((log) => {
    const evidenceItem = evidenceMap.get(String(log.evidenceId?._id || log.evidenceId));
    const actionLabelMap = {
      upload: "Evidence Uploaded",
      access: "Evidence Accessed",
      analyze: "Evidence Analyzed",
      verify: "Evidence Verified",
    };

    return {
      timestamp: log.timestamp,
      eventType: `EVIDENCE_${String(log.action).toUpperCase()}`,
      description: `${actionLabelMap[log.action] || "Evidence Action"}${evidenceItem ? `: ${evidenceItem.fileName}` : ""}`,
    };
  });

  const analysisEvents = analysisReports.map((report) => {
    const evidenceItem = evidenceMap.get(String(report.evidenceId?._id || report.evidenceId));

    return {
      timestamp: report.createdAt,
      eventType: "ANALYSIS_COMPLETED",
      description: `Analysis completed${evidenceItem ? ` for ${evidenceItem.fileName}` : ""} with risk score ${report.riskScore}`,
    };
  });

  return [...evidenceEvents, ...custodyEvents, ...analysisEvents]
    .sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp))
    .map((item) => ({
      timestamp: item.timestamp,
      eventType: item.eventType,
      description: item.description,
    }));
}

async function generateTimeline(caseId, user) {
  const caseRecord = await getAccessibleCase(caseId, user);

  const evidence = await Evidence.find({ caseId: caseRecord._id, isDeleted: false })
    .select("fileName createdAt")
    .sort({ createdAt: 1 })
    .lean();

  const evidenceIds = evidence.map((item) => item._id);

  const [custodyLogs, analysisReports] = await Promise.all([
    ChainOfCustody.find({ evidenceId: { $in: evidenceIds } })
      .populate("evidenceId", "fileName")
      .sort({ timestamp: 1 })
      .lean(),
    AnalysisReport.find({ caseId: caseRecord._id })
      .populate("evidenceId", "fileName")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const timeline = buildTimelineEntries({ evidence, custodyLogs, analysisReports });
  const actorId = user.userId || user._id;

  await recordIntelligenceCustody(evidenceIds, actorId, "Case timeline reconstruction generated.");
  await logIntelligenceEvent("TIMELINE_GENERATED", caseRecord._id, actorId, {
    evidenceCount: evidence.length,
    timelineLength: timeline.length,
  });

  return timeline;
}

async function getCaseThreatCorpus(caseIds) {
  const reports = await AnalysisReport.find({ caseId: { $in: caseIds } }).select("caseId threatsDetected explanation").lean();
  const threatMap = new Map();

  reports.forEach((report) => {
    const key = String(report.caseId);
    const fragments = [
      ...(report.threatsDetected || []),
      report.explanation || "",
    ];
    threatMap.set(key, [...(threatMap.get(key) || []), ...fragments]);
  });

  return threatMap;
}

async function findSimilarCases(caseId, user) {
  const targetCase = await getAccessibleCase(caseId, user);
  const actorId = user.userId || user._id;
  const targetEvidenceIds = await Evidence.find({ caseId: targetCase._id, isDeleted: false }).distinct("_id");
  const otherCases = await Case.find({
    _id: { $ne: targetCase._id },
    isDeleted: false,
  })
    .select("title description")
    .lean();

  if (!otherCases.length) {
    await recordIntelligenceCustody(targetEvidenceIds, actorId, "Similar case analysis generated.");
    await logIntelligenceEvent("SIMILAR_CASES_FOUND", targetCase._id, actorId, {
      matchedCases: 0,
    });
    return [];
  }

  const allCaseIds = [targetCase._id, ...otherCases.map((item) => item._id)];
  const threatCorpus = await getCaseThreatCorpus(allCaseIds);

  const targetText = [
    targetCase.title,
    targetCase.description,
    ...(threatCorpus.get(String(targetCase._id)) || []),
  ].join(" ");

  const caseDocuments = [
    targetText,
    ...otherCases.map((item) =>
      [item.title, item.description, ...(threatCorpus.get(String(item._id)) || [])].join(" "),
    ),
  ];

  const { vectors } = vectorizeText(caseDocuments);
  const [targetVector, ...otherVectors] = vectors;

  const matches = otherCases
    .map((item, index) => ({
      caseId: item._id,
      title: item.title,
      similarityScore: Number(cosineSimilarity(targetVector, otherVectors[index]).toFixed(4)),
    }))
    .filter((item) => item.similarityScore > 0)
    .sort((left, right) => right.similarityScore - left.similarityScore)
    .slice(0, 3);

  await recordIntelligenceCustody(targetEvidenceIds, actorId, "Similar case analysis generated.");
  await logIntelligenceEvent("SIMILAR_CASES_FOUND", targetCase._id, actorId, {
    matchedCases: matches.length,
    topSimilarityScore: matches[0]?.similarityScore || 0,
  });

  return matches;
}

module.exports = {
  generateTimeline,
  findSimilarCases,
};
