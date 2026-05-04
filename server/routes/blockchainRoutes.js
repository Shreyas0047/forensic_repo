const express = require("express");
const { param } = require("express-validator");
const { storeEvidence, verifyEvidence, getProof } = require("../controllers/blockchainController");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

const router = express.Router();

const evidenceIdValidation = [
  param("evidenceId").isMongoId().withMessage("evidenceId must be a valid MongoDB ObjectId."),
];

router.post(
  "/store/:evidenceId",
  authorizeRoles("Admin", "Investigator"),
  evidenceIdValidation,
  handleValidationErrors,
  storeEvidence,
);

router.get(
  "/verify/:evidenceId",
  authorizeRoles("Admin", "Investigator"),
  evidenceIdValidation,
  handleValidationErrors,
  verifyEvidence,
);

router.get(
  "/proof/:evidenceId",
  authorizeRoles("Admin", "Investigator"),
  evidenceIdValidation,
  handleValidationErrors,
  getProof,
);

module.exports = router;
