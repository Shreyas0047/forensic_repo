const asyncHandler = require("../utils/asyncHandler");
const {
  storeEvidenceOnBlockchain,
  verifyEvidenceOnBlockchain,
  getBlockchainProof,
} = require("../services/blockchainService");

exports.storeEvidence = asyncHandler(async (req, res) => {
  const data = await storeEvidenceOnBlockchain(req.params.evidenceId, req.user);
  res.status(200).json({ success: true, data });
});

exports.verifyEvidence = asyncHandler(async (req, res) => {
  const data = await verifyEvidenceOnBlockchain(req.params.evidenceId, req.user);
  res.status(200).json({ success: true, data });
});

exports.getProof = asyncHandler(async (req, res) => {
  const data = await getBlockchainProof(req.params.evidenceId, req.user);
  res.status(200).json({ success: true, data });
});
