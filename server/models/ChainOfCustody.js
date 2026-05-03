const mongoose = require("mongoose");

const chainOfCustodySchema = new mongoose.Schema(
  {
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evidence",
      required: [true, "Evidence reference is required."],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Custody action is required."],
      enum: ["upload", "access", "analyze", "verify"],
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Performer reference is required."],
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

chainOfCustodySchema.index({ evidenceId: 1, timestamp: 1 });
chainOfCustodySchema.index({ performedBy: 1, timestamp: -1 });
chainOfCustodySchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model("ChainOfCustody", chainOfCustodySchema);
