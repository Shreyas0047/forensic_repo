const Alert = require("../models/Alert");
const EventLog = require("../models/EventLog");

async function createAlert(message, severity, relatedCase = null, metadata = {}, performedBy = null) {
  const alert = await Alert.create({
    message,
    severity,
    relatedCase,
    metadata,
  });

  await EventLog.create({
    eventType: "ALERT_CREATED",
    entityType: relatedCase ? "Case" : "User",
    entityId: relatedCase || performedBy,
    performedBy,
    metadata: {
      alertId: alert._id,
      severity,
      source: "darkweb",
      ...metadata,
    },
  });

  return alert;
}

async function getAlerts(filter = {}) {
  return Alert.find(filter)
    .populate("relatedCase", "title status priority")
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = {
  createAlert,
  getAlerts,
};
