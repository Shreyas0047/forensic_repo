const express = require("express");
const { param } = require("express-validator");
const {
  analyzeEvidence,
  getAnalysisReport,
  getCaseAnalysisReports,
} = require("../controllers/analysisController");
const { requireRole } = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

const router = express.Router();

const evidenceIdValidation = [
  param("evidenceId").isMongoId().withMessage("evidenceId must be a valid MongoDB ObjectId."),
];

const caseIdValidation = [
  param("caseId").isMongoId().withMessage("caseId must be a valid MongoDB ObjectId."),
];

router.get("/case/:caseId", requireRole("ADMIN", "INVESTIGATOR", "ANALYST"), caseIdValidation, handleValidationErrors, getCaseAnalysisReports);
router.post("/:evidenceId", requireRole("ADMIN", "INVESTIGATOR", "ANALYST"), evidenceIdValidation, handleValidationErrors, analyzeEvidence);
router.get("/:evidenceId", requireRole("ADMIN", "INVESTIGATOR", "ANALYST"), evidenceIdValidation, handleValidationErrors, getAnalysisReport);

module.exports = router;
