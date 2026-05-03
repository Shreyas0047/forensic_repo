const crypto = require("crypto");

function createBlockchainRecord({ caseId, evidenceId, hash, previousHash = "GENESIS" }) {
  const timestamp = new Date().toISOString();
  const payload = `${caseId}:${evidenceId}:${hash}:${previousHash}:${timestamp}`;
  const transactionHash = crypto.createHash("sha256").update(payload).digest("hex");

  return {
    network: "forensics-ledger-sim",
    previousHash,
    transactionHash,
    anchoredAt: new Date(timestamp),
  };
}

module.exports = {
  createBlockchainRecord,
};
