const axios = require("axios");
const fs = require("fs");
const path = require("path");

function resolveAiBaseUrl() {
  if (process.env.AI_SERVICE_URL) {
    return process.env.AI_SERVICE_URL;
  }

  if (process.env.AI_SERVICE_HOSTPORT) {
    return `http://${process.env.AI_SERVICE_HOSTPORT}`;
  }

  return "http://127.0.0.1:5001";
}

const aiHttpClient = axios.create({
  baseURL: resolveAiBaseUrl(),
  timeout: 30000,
});

async function analyzeText(text) {
  const { data } = await aiHttpClient.post("/analyze/text", { text });
  return data.data;
}

async function analyzeLog(logData) {
  const { data } = await aiHttpClient.post("/analyze/log", { logData });
  return data.data;
}

async function analyzeImage(filePath) {
  const resolvedPath = path.resolve(filePath);
  const fileBuffer = await fs.promises.readFile(resolvedPath);
  const formData = new FormData();
  const fileName = path.basename(resolvedPath);
  const mimeType = `image/${path.extname(fileName).replace(".", "").toLowerCase() || "jpeg"}`;

  formData.append("image", new Blob([fileBuffer], { type: mimeType }), fileName);

  const { data } = await aiHttpClient.post("/analyze/image", formData, {
    headers: {
      ...formData.getHeaders?.(),
    },
  });

  return data.data;
}

module.exports = {
  analyzeText,
  analyzeLog,
  analyzeImage,
};
