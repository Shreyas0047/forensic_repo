const asyncHandler = require("../utils/asyncHandler");
const {
  runEvidenceAnalysis,
  getAnalysisReport,
  getCaseAnalysisReports,
} = require("../services/analysisService");

exports.analyzeEvidence = asyncHandler(async (req, res) => {
  const data = await runEvidenceAnalysis(req.params.evidenceId, req.user);
  res.status(200).json({ success: true, data });
});

exports.getAnalysisReport = asyncHandler(async (req, res) => {
  const data = await getAnalysisReport(req.params.evidenceId, req.user);
  res.status(200).json({ success: true, data });
});

exports.getCaseAnalysisReports = asyncHandler(async (req, res) => {
  const data = await getCaseAnalysisReports(req.params.caseId, req.user);
  res.status(200).json({ success: true, data });
});
