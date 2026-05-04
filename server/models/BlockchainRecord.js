const mongoose = require("mongoose");

const blockchainRecordSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evidence",
      required: [true, "Evidence reference is required."],
      unique: true,
      index: true,
    },
    hash: {
      type: String,
      required: [true, "Hash is required."],
      trim: true,
      uppercase: true,
      match: [/^[A-F0-9]{64}$/, "Hash must be a valid SHA-256 hex digest."],
    },
    transactionId: {
      type: String,
      required: [true, "Transaction id is required."],
      trim: true,
      maxlength: 255,
    },
    blockNumber: {
      type: Number,
      required: [true, "Block number is required."],
      min: 0,
    },
    network: {
      type: String,
      required: [true, "Blockchain network is required."],
      trim: true,
      enum: ["Ganache", "Ethereum", "Sepolia", "Amoy", "CustomEVM"],
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    chainOfCustodyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChainOfCustody",
      default: null,
      index: true,
    },
    verificationProof: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

blockchainRecordSchema.index({ evidenceId: 1 });
blockchainRecordSchema.index({ transactionId: 1 }, { unique: true });
blockchainRecordSchema.index({ verified: 1, network: 1 });

module.exports = mongoose.model("BlockchainRecord", blockchainRecordSchema);
