const Alert = require("../models/Alert");
const EventLog = require("../models/EventLog");
const { emitAlert } = require("../realtime/socket");

const severityRank = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

async function createAlert(message, severity, relatedCase = null, metadata = {}, performedBy = null) {
  const alert = await Alert.create({
    message,
    severity,
    relatedCase,
    threatType: metadata.threatType || "Suspicious Activity",
    confidenceScore: metadata.confidenceScore || 0,
    metadata,
  });

  await EventLog.create({
    eventType: "ALERT_CREATED",
    entityType: relatedCase ? "Case" : "User",
    entityId: relatedCase || performedBy,
    performedBy,
    threatType: alert.threatType,
    severity: alert.severity,
    metadata: {
      alertId: alert._id,
      severity,
      source: "darkweb",
      ...metadata,
    },
  });

  const payload = {
    type: "NEW_ALERT",
    alertId: alert._id,
    message: alert.message,
    threatType: alert.threatType,
    severity: alert.severity,
    confidenceScore: alert.confidenceScore,
    createdAt: alert.createdAt,
  };

  emitAlert("NEW_ALERT", payload);

  if (alert.severity === "high" || alert.severity === "critical") {
    emitAlert("HIGH_RISK_DETECTED", {
      ...payload,
      type: "HIGH_RISK_DETECTED",
    });
  }

  return alert;
}

async function getAlerts(filter = {}) {
  const alerts = await Alert.find(filter)
    .populate("relatedCase", "title status priority")
    .sort({ createdAt: -1 })
    .lean();

  return alerts.sort(
    (left, right) =>
      (severityRank[right.severity] || 0) - (severityRank[left.severity] || 0) ||
      new Date(right.createdAt) - new Date(left.createdAt),
  );
}

module.exports = {
  createAlert,
  getAlerts,
};
