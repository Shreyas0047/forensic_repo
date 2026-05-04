const express = require("express");
const { param } = require("express-validator");
const { getTimeline, getSimilarCases } = require("../controllers/intelligenceController");
const { requireRole } = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

const router = express.Router();

const caseIdValidation = [
  param("caseId").isMongoId().withMessage("caseId must be a valid MongoDB ObjectId."),
];

router.get("/timeline/:caseId", requireRole("ADMIN", "INVESTIGATOR", "ANALYST", "VIEWER"), caseIdValidation, handleValidationErrors, getTimeline);
router.get("/similar-cases/:caseId", requireRole("ADMIN", "INVESTIGATOR", "ANALYST"), caseIdValidation, handleValidationErrors, getSimilarCases);

module.exports = router;
