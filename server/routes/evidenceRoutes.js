const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { body, param } = require("express-validator");
const {
  uploadEvidence,
  getEvidenceByCase,
  getSingleEvidence,
  verifyEvidence,
  deleteEvidence,
} = require("../controllers/evidenceController");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");
const AppError = require("../utils/AppError");
const { ensureUploadsDirectory } = require("../utils/storagePaths");

const router = express.Router();

const uploadsDirectory = ensureUploadsDirectory();
const allowedMimeTypes = new Set(["image/png", "image/jpeg", "text/plain", "application/json"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "evidence";
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new AppError("Unsupported file type.", 400));
    }

    return cb(null, true);
  },
});

const uploadValidation = [
  body("caseId").isMongoId().withMessage("caseId must be a valid MongoDB ObjectId."),
];

const caseIdValidation = [
  param("caseId").isMongoId().withMessage("caseId must be a valid MongoDB ObjectId."),
];

const evidenceIdValidation = [
  param("id").isMongoId().withMessage("id must be a valid MongoDB ObjectId."),
];

router.post("/upload", upload.single("file"), uploadValidation, handleValidationErrors, uploadEvidence);
router.get("/case/:caseId", caseIdValidation, handleValidationErrors, getEvidenceByCase);
router.get("/:id", evidenceIdValidation, handleValidationErrors, getSingleEvidence);
router.post("/:id/verify", evidenceIdValidation, handleValidationErrors, verifyEvidence);
router.delete("/:id", authorizeRoles("Admin"), evidenceIdValidation, handleValidationErrors, deleteEvidence);

module.exports = router;
