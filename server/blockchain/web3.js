require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const { Web3 } = require("web3");

const artifactPath = path.resolve(__dirname, "build", "EvidenceContract.json");
const providerUrl = process.env.GANACHE_URL || "http://127.0.0.1:7545";

const web3 = new Web3(providerUrl);

function getContractArtifact() {
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Compiled contract artifact not found. Run deploy.js first.");
  }

  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

function getEvidenceContract() {
  const artifact = getContractArtifact();
  return new web3.eth.Contract(artifact.abi, process.env.EVIDENCE_CONTRACT_ADDRESS || artifact.address);
}

module.exports = {
  web3,
  getEvidenceContract,
  getContractArtifact,
};
