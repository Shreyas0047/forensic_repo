const mongoose = require("mongoose");
const Evidence = require("../models/Evidence");
const Case = require("../models/Case");
const BlockchainRecord = require("../models/BlockchainRecord");
const ChainOfCustody = require("../models/ChainOfCustody");
const EventLog = require("../models/EventLog");
const AppError = require("../utils/AppError");
const { web3, getEvidenceContract } = require("../blockchain/web3");

function ensureObjectId(value, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
}

async function getAccessibleEvidence(evidenceId, user) {
  ensureObjectId(evidenceId, "evidenceId");

  const evidence = await Evidence.findOne({ _id: evidenceId, isDeleted: false });
  if (!evidence) {
    throw new AppError("Evidence not found.", 404);
  }

  const caseRecord = await Case.findOne({ _id: evidence.caseId, isDeleted: false });
  if (!caseRecord) {
    throw new AppError("Associated case not found.", 404);
  }

  const actorId = String(user.userId || user._id);
  const hasAccess =
    user.role === "Admin" ||
    user.role === "Investigator" ||
    String(caseRecord.createdBy) === actorId ||
    String(caseRecord.assignedTo) === actorId;

  if (!hasAccess) {
    throw new AppError("Forbidden: you are not authorized to verify this evidence.", 403);
  }

  return { evidence, caseRecord };
}

async function addCustodyVerification(evidenceId, performedBy, notes) {
  await ChainOfCustody.create({
    evidenceId,
    action: "verify",
    performedBy,
    timestamp: new Date(),
    notes,
  });
}

async function addBlockchainEvent(eventType, evidenceId, performedBy, metadata = {}) {
  await EventLog.create({
    eventType,
    entityType: "Evidence",
    entityId: evidenceId,
    performedBy,
    metadata,
  });
}

function normalizeHashForChain(hash) {
  return `0x${String(hash).replace(/^0x/i, "").toLowerCase()}`;
}

function normalizeHashFromChain(hash) {
  return String(hash).replace(/^0x/i, "").toUpperCase();
}

async function storeEvidenceOnBlockchain(evidenceId, user) {
  const { evidence } = await getAccessibleEvidence(evidenceId, user);
  const contract = getEvidenceContract();
  const accounts = await web3.eth.getAccounts();
  const sender = process.env.ETH_ACCOUNT || accounts[0];

  if (!sender) {
    throw new AppError("No Ganache account available for blockchain transaction.", 500);
  }

  let receipt;
  try {
    receipt = await contract.methods
      .storeEvidence(normalizeHashForChain(evidence.hash), String(evidence._id))
      .send({ from: sender, gas: 3000000 });
  } catch (error) {
    throw new AppError("Failed to store evidence on blockchain.", 502, { reason: error.message });
  }

  const blockchainRecord = await BlockchainRecord.findOneAndUpdate(
    { evidenceId: evidence._id },
    {
      evidenceId: evidence._id,
      hash: evidence.hash,
      transactionId: receipt.transactionHash,
      blockNumber: Number(receipt.blockNumber),
      network: "Ganache",
      verified: true,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  await addCustodyVerification(
    evidence._id,
    user.userId || user._id,
    "Evidence hash stored on Ganache blockchain.",
  );

  await addBlockchainEvent("BLOCKCHAIN_STORED", evidence._id, user.userId || user._id, {
    transactionId: receipt.transactionHash,
    blockNumber: Number(receipt.blockNumber),
    network: "Ganache",
  });

  return blockchainRecord;
}

async function verifyEvidenceOnBlockchain(evidenceId, user) {
  const { evidence } = await getAccessibleEvidence(evidenceId, user);
  const blockchainRecord = await BlockchainRecord.findOne({ evidenceId: evidence._id });

  if (!blockchainRecord) {
    throw new AppError("Blockchain record not found for this evidence.", 404);
  }

  const contract = getEvidenceContract();
  let onChainRecord;

  try {
    onChainRecord = await contract.methods.getEvidence(String(evidence._id)).call();
  } catch (error) {
    throw new AppError("Failed to retrieve blockchain evidence record.", 502, { reason: error.message });
  }

  const blockchainHash = normalizeHashFromChain(onChainRecord[0]);
  const verified = blockchainHash === evidence.hash;

  blockchainRecord.verified = verified;
  await blockchainRecord.save();

  await addCustodyVerification(
    evidence._id,
    user.userId || user._id,
    verified ? "Blockchain integrity verification succeeded." : "Blockchain integrity verification failed.",
  );

  await addBlockchainEvent("BLOCKCHAIN_VERIFIED", evidence._id, user.userId || user._id, {
    verified,
    blockchainHash,
    databaseHash: evidence.hash,
    transactionId: blockchainRecord.transactionId,
  });

  return {
    evidenceId: evidence._id,
    verified,
    blockchainHash,
    databaseHash: evidence.hash,
    transactionId: blockchainRecord.transactionId,
    blockNumber: blockchainRecord.blockNumber,
    network: blockchainRecord.network,
    timestamp: Number(onChainRecord[1]),
  };
}

module.exports = {
  storeEvidenceOnBlockchain,
  verifyEvidenceOnBlockchain,
};
