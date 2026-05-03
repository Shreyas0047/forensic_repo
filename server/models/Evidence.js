const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: [true, "Evidence must belong to a case."],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required."],
      trim: true,
      maxlength: 255,
    },
    storageName: {
      type: String,
      required: [true, "Stored file name is required."],
      trim: true,
      maxlength: 255,
    },
    filePath: {
      type: String,
      required: [true, "File path is required."],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required."],
      trim: true,
      maxlength: 120,
    },
    fileType: {
      type: String,
      enum: ["image", "log", "text", "other"],
      required: [true, "File type is required."],
      index: true,
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required."],
      min: 0,
    },
    hash: {
      type: String,
      required: [true, "SHA-256 hash is required."],
      index: true,
      trim: true,
      uppercase: true,
      match: [/^[A-F0-9]{64}$/, "Hash must be a valid SHA-256 hex digest."],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader reference is required."],
      index: true,
    },
    isTampered: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

evidenceSchema.index({ caseId: 1, createdAt: -1 });
evidenceSchema.index({ hash: 1 });
evidenceSchema.index({ uploadedBy: 1 });
evidenceSchema.index({ isTampered: 1, caseId: 1 });
evidenceSchema.index({ isDeleted: 1, caseId: 1 });

module.exports = mongoose.model("Evidence", evidenceSchema);
