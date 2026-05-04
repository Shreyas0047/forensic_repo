const mongoose = require("mongoose");

const eventLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: [true, "Event type is required."],
      index: true,
      trim: true,
      uppercase: true,
    },
    entityType: {
      type: String,
      enum: ["Case", "Evidence", "User"],
      required: [true, "Entity type is required."],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Entity id is required."],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    threatType: {
      type: String,
      default: null,
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical", null],
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

eventLogSchema.index({ eventType: 1, createdAt: -1 });
eventLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
eventLogSchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model("EventLog", eventLogSchema);
