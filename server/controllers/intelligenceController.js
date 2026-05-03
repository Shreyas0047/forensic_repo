const asyncHandler = require("../utils/asyncHandler");
const { generateTimeline, findSimilarCases } = require("../services/intelligenceService");

exports.getTimeline = asyncHandler(async (req, res) => {
  const data = await generateTimeline(req.params.caseId, req.user);
  res.status(200).json({ success: true, data });
});

exports.getSimilarCases = asyncHandler(async (req, res) => {
  const data = await findSimilarCases(req.params.caseId, req.user);
  res.status(200).json({ success: true, data });
});
