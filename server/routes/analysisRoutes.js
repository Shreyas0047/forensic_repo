const express = require("express");
const { param } = require("express-validator");
const {
  analyzeEvidence,
  getAnalysisReport,
  getCaseAnalysisReports,
} = require("../controllers/analysisController");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

const router = express.Router();

const evidenceIdValidation = [
  param("evidenceId").isMongoId().withMessage("evidenceId must be a valid MongoDB ObjectId."),
];

const caseIdValidation = [
  param("caseId").isMongoId().withMessage("caseId must be a valid MongoDB ObjectId."),
];

router.get("/case/:caseId", caseIdValidation, handleValidationErrors, getCaseAnalysisReports);
router.post("/:evidenceId", evidenceIdValidation, handleValidationErrors, analyzeEvidence);
router.get("/:evidenceId", evidenceIdValidation, handleValidationErrors, getAnalysisReport);

module.exports = router;
