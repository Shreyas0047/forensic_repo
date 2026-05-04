const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Alert message is required."],
      trim: true,
      maxlength: 1000,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: [true, "Alert severity is required."],
      index: true,
    },
    threatType: {
      type: String,
      default: "Suspicious Activity",
      trim: true,
      index: true,
    },
    confidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    relatedCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      default: null,
      index: true,
    },
    source: {
      type: String,
      default: "darkweb",
      trim: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

alertSchema.index({ severity: 1, createdAt: -1 });
alertSchema.index({ threatType: 1, severity: 1 });
alertSchema.index({ source: 1, createdAt: -1 });

module.exports = mongoose.model("Alert", alertSchema);
