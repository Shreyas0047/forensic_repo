const asyncHandler = require("../utils/asyncHandler");
const {
  createCase,
  getAllCases,
  getSingleCase,
  updateCase,
  updateCaseStatus,
  assignCase,
  deleteCase,
} = require("../services/caseService");

exports.createCase = asyncHandler(async (req, res) => {
  const data = await createCase(req.body, req.user);
  res.status(201).json({ success: true, data });
});

exports.getAllCases = asyncHandler(async (req, res) => {
  const data = await getAllCases(req.query, req.user);
  res.status(200).json({ success: true, data });
});

exports.getSingleCase = asyncHandler(async (req, res) => {
  const data = await getSingleCase(req.params.id, req.user);
  res.status(200).json({ success: true, data });
});

exports.updateCase = asyncHandler(async (req, res) => {
  const data = await updateCase(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data });
});

exports.updateCaseStatus = asyncHandler(async (req, res) => {
  const data = await updateCaseStatus(req.params.id, req.body.status, req.user);
  res.status(200).json({ success: true, data });
});

exports.assignCase = asyncHandler(async (req, res) => {
  const data = await assignCase(req.params.id, req.body.assignedTo, req.user);
  res.status(200).json({ success: true, data });
});

exports.deleteCase = asyncHandler(async (req, res) => {
  const data = await deleteCase(req.params.id, req.user);
  res.status(200).json({ success: true, data });
});
