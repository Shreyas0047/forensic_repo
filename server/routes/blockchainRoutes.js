const express = require("express");
const { param } = require("express-validator");
const { storeEvidence, verifyEvidence, getProof } = require("../controllers/blockchainController");
const { requireRole } = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

const router = express.Router();

const evidenceIdValidation = [
  param("evidenceId").isMongoId().withMessage("evidenceId must be a valid MongoDB ObjectId."),
];

router.post(
  "/store/:evidenceId",
  requireRole("ADMIN", "INVESTIGATOR"),
  evidenceIdValidation,
  handleValidationErrors,
  storeEvidence,
);

router.get(
  "/verify/:evidenceId",
  requireRole("ADMIN", "INVESTIGATOR"),
  evidenceIdValidation,
  handleValidationErrors,
  verifyEvidence,
);

router.get(
  "/proof/:evidenceId",
  requireRole("ADMIN", "INVESTIGATOR", "ANALYST"),
  evidenceIdValidation,
  handleValidationErrors,
  getProof,
);

module.exports = router;
