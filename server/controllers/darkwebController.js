const asyncHandler = require("../utils/asyncHandler");
const {
  analyzeDarkwebDataset,
  getAllAlerts,
  getHighSeverityAlerts,
} = require("../services/darkwebService");

exports.analyzeDarkweb = asyncHandler(async (req, res) => {
  const data = await analyzeDarkwebDataset(req.user);
  res.status(200).json({ success: true, data });
});

exports.getAlerts = asyncHandler(async (req, res) => {
  const data = await getAllAlerts();
  res.status(200).json({ success: true, data });
});

exports.getHighAlerts = asyncHandler(async (req, res) => {
  const data = await getHighSeverityAlerts();
  res.status(200).json({ success: true, data });
});
