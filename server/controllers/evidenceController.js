const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  uploadEvidence,
  getEvidenceByCase,
  getSingleEvidence,
  verifyEvidence,
  deleteEvidence,
} = require("../services/evidenceService");

exports.uploadEvidence = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Evidence file is required.", 400);
  }

  const data = await uploadEvidence({
    caseId: req.body.caseId,
    file: req.file,
    user: req.user,
  });

  res.status(201).json({ success: true, data });
});

exports.getEvidenceByCase = asyncHandler(async (req, res) => {
  const data = await getEvidenceByCase(req.params.caseId, req.user);
  res.status(200).json({ success: true, data });
});

exports.getSingleEvidence = asyncHandler(async (req, res) => {
  const data = await getSingleEvidence(req.params.id, req.user);
  res.status(200).json({ success: true, data });
});

exports.verifyEvidence = asyncHandler(async (req, res) => {
  const data = await verifyEvidence(req.params.id, req.user);
  res.status(200).json({ success: true, data });
});

exports.deleteEvidence = asyncHandler(async (req, res) => {
  const data = await deleteEvidence(req.params.id, req.user);
  res.status(200).json({ success: true, data });
});
