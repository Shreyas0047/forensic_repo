const EventLog = require("../models/EventLog");

async function logEvent(payload) {
  return EventLog.create(payload);
}

async function getRecentEvents(limit = 10) {
  return EventLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

async function getCaseEvents(caseId) {
  return EventLog.find({ caseId }).sort({ createdAt: -1 }).lean();
}

module.exports = {
  logEvent,
  getRecentEvents,
  getCaseEvents,
};
