const express = require("express");
const { param } = require("express-validator");
const { getTimeline, getSimilarCases } = require("../controllers/intelligenceController");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

const router = express.Router();

const caseIdValidation = [
  param("caseId").isMongoId().withMessage("caseId must be a valid MongoDB ObjectId."),
];

router.get("/timeline/:caseId", caseIdValidation, handleValidationErrors, getTimeline);
router.get("/similar-cases/:caseId", caseIdValidation, handleValidationErrors, getSimilarCases);

module.exports = router;
