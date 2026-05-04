const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createCase,
  getAllCases,
  getSingleCase,
  updateCase,
  updateCaseStatus,
  assignCase,
  deleteCase,
} = require("../controllers/caseController");
const { requireRole } = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

const router = express.Router();

const objectIdValidator = (field) =>
  param(field).isMongoId().withMessage(`${field} must be a valid MongoDB ObjectId.`);

const listCasesValidation = [
  query("status").optional().isIn(["pending", "in-progress", "closed"]).withMessage("Invalid status filter."),
  query("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority filter."),
  query("createdBy").optional().isMongoId().withMessage("createdBy must be a valid MongoDB ObjectId."),
  query("assignedTo").optional().isMongoId().withMessage("assignedTo must be a valid MongoDB ObjectId."),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100."),
];

const createCaseValidation = [
  body("title").trim().isLength({ min: 3 }).withMessage("title must be at least 3 characters long."),
  body("description").optional().isString().withMessage("description must be a string."),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("priority must be low, medium, or high."),
  body("tags").optional().isArray().withMessage("tags must be an array."),
];

const updateCaseValidation = [
  objectIdValidator("id"),
  body("title").optional().trim().isLength({ min: 3 }).withMessage("title must be at least 3 characters long."),
  body("description").optional().isString().withMessage("description must be a string."),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("priority must be low, medium, or high."),
  body("tags").optional().isArray().withMessage("tags must be an array."),
];

const updateStatusValidation = [
  objectIdValidator("id"),
  body("status").isIn(["pending", "in-progress", "closed"]).withMessage("status must be pending, in-progress, or closed."),
];

const assignCaseValidation = [
  objectIdValidator("id"),
  body("assignedTo").isMongoId().withMessage("assignedTo must be a valid MongoDB ObjectId."),
];

const caseIdValidation = [objectIdValidator("id")];

router.post("/", requireRole("ADMIN", "INVESTIGATOR"), createCaseValidation, handleValidationErrors, createCase);
router.get("/", requireRole("ADMIN", "INVESTIGATOR", "ANALYST", "VIEWER"), listCasesValidation, handleValidationErrors, getAllCases);
router.get("/:id", requireRole("ADMIN", "INVESTIGATOR", "ANALYST", "VIEWER"), caseIdValidation, handleValidationErrors, getSingleCase);
router.put("/:id", requireRole("ADMIN", "INVESTIGATOR"), updateCaseValidation, handleValidationErrors, updateCase);
router.patch("/:id/status", requireRole("ADMIN", "INVESTIGATOR"), updateStatusValidation, handleValidationErrors, updateCaseStatus);
router.patch(
  "/:id/assign",
  requireRole("ADMIN"),
  assignCaseValidation,
  handleValidationErrors,
  assignCase,
);
router.delete("/:id", requireRole("ADMIN"), caseIdValidation, handleValidationErrors, deleteCase);

module.exports = router;
