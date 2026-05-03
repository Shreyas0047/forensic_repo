const axios = require("axios");

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://127.0.0.1:5001",
  timeout: 10000,
});

async function analyzeEvidenceArtifact(evidence) {
  const { data } = await aiClient.post("/analyze", {
    evidenceId: evidence._id,
    filename: evidence.originalName,
    mimeType: evidence.mimeType,
    size: evidence.size,
    hash: evidence.hash,
    notes: evidence.notes,
    source: evidence.source,
  });

  return data.data;
}

module.exports = {
  analyzeEvidenceArtifact,
};
