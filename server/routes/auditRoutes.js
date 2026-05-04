const express = require("express");
const { param, query } = require("express-validator");
const {
  getEvidenceAudit,
  getCaseAudit,
  getUserActivity,
  exportCaseAudit,
} = require("../controllers/auditController");
const { requireRole } = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

const router = express.Router();

const evidenceIdValidation = [
  param("evidenceId").isMongoId().withMessage("evidenceId must be a valid MongoDB ObjectId."),
];

const caseIdValidation = [
  param("caseId").isMongoId().withMessage("caseId must be a valid MongoDB ObjectId."),
];

const userIdValidation = [
  param("userId").isMongoId().withMessage("userId must be a valid MongoDB ObjectId."),
];

const exportValidation = [
  ...caseIdValidation,
  query("format").optional().isIn(["json", "csv"]).withMessage("format must be json or csv."),
];

router.get("/evidence/:evidenceId", requireRole("ADMIN", "INVESTIGATOR", "ANALYST", "VIEWER"), evidenceIdValidation, handleValidationErrors, getEvidenceAudit);
router.get("/case/:caseId", requireRole("ADMIN", "INVESTIGATOR", "ANALYST", "VIEWER"), caseIdValidation, handleValidationErrors, getCaseAudit);
router.get("/user/:userId", requireRole("ADMIN", "INVESTIGATOR", "ANALYST", "VIEWER"), userIdValidation, handleValidationErrors, getUserActivity);
router.get("/export/:caseId", requireRole("ADMIN", "INVESTIGATOR"), exportValidation, handleValidationErrors, exportCaseAudit);

module.exports = router;
