const asyncHandler = require("../utils/asyncHandler");
const {
  getEvidenceChainOfCustody,
  getCaseAuditTrail,
  getUserActivityLogs,
  exportCaseAuditLogs,
} = require("../services/auditService");

exports.getEvidenceAudit = asyncHandler(async (req, res) => {
  const data = await getEvidenceChainOfCustody(req.params.evidenceId, req.user);
  res.status(200).json({ success: true, data });
});

exports.getCaseAudit = asyncHandler(async (req, res) => {
  const data = await getCaseAuditTrail(req.params.caseId, req.user);
  res.status(200).json({ success: true, data });
});

exports.getUserActivity = asyncHandler(async (req, res) => {
  const data = await getUserActivityLogs(req.params.userId, req.user);
  res.status(200).json({ success: true, data });
});

exports.exportCaseAudit = asyncHandler(async (req, res) => {
  const data = await exportCaseAuditLogs(req.params.caseId, req.user, req.query.format);
  res.status(200).json({ success: true, data });
});
