const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Case title is required."],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "high",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "closed"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Case creator is required."],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 50,
        },
      ],
      default: [],
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

caseSchema.index({ createdBy: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ assignedTo: 1, status: 1 });
caseSchema.index({ tags: 1 });
caseSchema.index({ isDeleted: 1, status: 1 });

module.exports = mongoose.model("Case", caseSchema);
