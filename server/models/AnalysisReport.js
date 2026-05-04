const mongoose = require("mongoose");

const analysisReportSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evidence",
      required: [true, "Evidence reference is required."],
      index: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: [true, "Case reference is required."],
      index: true,
    },
    riskScore: {
      type: Number,
      required: [true, "Risk score is required."],
      min: 0,
      max: 100,
    },
    finalRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
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
    threatsDetected: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 200,
        },
      ],
      default: [],
    },
    aiModelUsed: {
      type: String,
      required: [true, "AI model identifier is required."],
      trim: true,
      maxlength: 120,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 10000,
    },
    rawOutput: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

analysisReportSchema.index({ evidenceId: 1, createdAt: -1 });
analysisReportSchema.index({ caseId: 1, createdAt: -1 });
analysisReportSchema.index({ riskScore: -1 });
analysisReportSchema.index({ finalRiskScore: -1, severity: 1 });
analysisReportSchema.index({ threatType: 1, createdAt: -1 });

module.exports = mongoose.model("AnalysisReport", analysisReportSchema);
