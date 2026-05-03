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
      enum: ["low", "medium", "high"],
      required: [true, "Alert severity is required."],
      index: true,
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
alertSchema.index({ source: 1, createdAt: -1 });

module.exports = mongoose.model("Alert", alertSchema);
