const fs = require("fs");
const path = require("path");
const Case = require("../models/Case");
const EventLog = require("../models/EventLog");
const AppError = require("../utils/AppError");
const { createAlert, getAlerts } = require("./alertService");
const { calculateRiskScore } = require("./riskEngine");
const { classifyThreat } = require("./threatClassifier");

const datasetPath = path.resolve(__dirname, "..", "data", "darkwebData.json");

const keywordWeights = {
  hack: 18,
  hacked: 18,
  exploit: 20,
  "leaked data": 22,
  leak: 16,
  leaked: 16,
  credentials: 18,
  credential: 18,
  ransomware: 28,
  malware: 24,
  password: 14,
  passwords: 14,
  breach: 20,
  compromised: 16,
  bypass: 10,
};

function preprocessContent(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractThreatSignals(content) {
  const normalized = preprocessContent(content);
  const detectedKeywords = Object.keys(keywordWeights).filter((keyword) => normalized.includes(keyword));
  const baseScore = detectedKeywords.reduce((sum, keyword) => sum + keywordWeights[keyword], 0);
  const densityBoost = Math.min(normalized.split(" ").length / 6, 10);
  const riskScore = Math.min(Math.round(baseScore + densityBoost), 100);

  return {
    detectedKeywords,
    riskScore,
    normalized,
  };
}

async function findRelatedCase(post) {
  const cases = await Case.find({ isDeleted: false }).select("title description").lean();
  const normalizedContent = preprocessContent(post.content);

  let bestMatch = null;
  let bestScore = 0;

  cases.forEach((caseItem) => {
    const caseTokens = preprocessContent(`${caseItem.title} ${caseItem.description}`).split(" ");
    const overlap = caseTokens.filter((token) => token.length > 3 && normalizedContent.includes(token));
    if (overlap.length > bestScore) {
      bestScore = overlap.length;
      bestMatch = caseItem;
    }
  });

  return bestScore >= 2 ? bestMatch : null;
}

function buildThreatMessage(threat, relatedCase) {
  return relatedCase
    ? `Dark web threat detected for case "${relatedCase.title}" with keywords: ${threat.detectedKeywords.join(", ")}`
    : `Dark web threat detected with keywords: ${threat.detectedKeywords.join(", ")}`;
}

async function analyzeDarkwebDataset(user) {
  if (!fs.existsSync(datasetPath)) {
    throw new AppError("Dark web dataset is missing.", 500);
  }

  const rawDataset = await fs.promises.readFile(datasetPath, "utf8");
  const posts = JSON.parse(rawDataset);
  const findings = [];

  for (const post of posts) {
    const threat = extractThreatSignals(post.content);
    if (!threat.detectedKeywords.length) {
      continue;
    }

    const relatedCase = await findRelatedCase(post);
    const classification = classifyThreat({
      threatsDetected: threat.detectedKeywords,
      darkWebFlags: threat.detectedKeywords,
      content: post.content,
    });
    const risk = calculateRiskScore({
      aiRiskScore: threat.riskScore,
      threatCount: threat.detectedKeywords.length,
      anomalyFlags: 0,
      darkWebFlags: 1,
    });
    const severity = risk.severity;
    const message = `${buildThreatMessage(threat, relatedCase)} (${classification.threatType})`;

    const finding = {
      id: post.id,
      content: post.content,
      timestamp: post.timestamp,
      riskScore: risk.finalRiskScore,
      detectedKeywords: threat.detectedKeywords,
      severity,
      threatType: classification.threatType,
      confidenceScore: classification.confidenceScore,
      reasoning: classification.reasoning,
      relatedCase: relatedCase?._id || null,
    };

    findings.push(finding);

    await EventLog.create({
      eventType: "DARKWEB_THREAT_DETECTED",
      entityType: relatedCase ? "Case" : "User",
      entityId: relatedCase?._id || user.userId || user._id,
      performedBy: user.userId || user._id,
      threatType: classification.threatType,
      severity,
      metadata: {
        postId: post.id,
        riskScore: risk.finalRiskScore,
        detectedKeywords: threat.detectedKeywords,
        threatType: classification.threatType,
        confidenceScore: classification.confidenceScore,
        reasoning: classification.reasoning,
      },
    });

    if (severity === "high" || severity === "critical") {
      await createAlert(
        message,
        severity,
        relatedCase?._id || null,
        {
          postId: post.id,
          riskScore: risk.finalRiskScore,
          detectedKeywords: threat.detectedKeywords,
          threatType: classification.threatType,
          confidenceScore: classification.confidenceScore,
          reasoning: classification.reasoning,
          content: post.content,
        },
        user.userId || user._id,
      );
    }
  }

  return {
    processed: posts.length,
    threatsDetected: findings.length,
    findings,
  };
}

async function getAllAlerts() {
  return getAlerts({ source: "darkweb" });
}

async function getHighSeverityAlerts() {
  return getAlerts({ source: "darkweb", severity: { $in: ["high", "critical"] } });
}

module.exports = {
  analyzeDarkwebDataset,
  getAllAlerts,
  getHighSeverityAlerts,
};
