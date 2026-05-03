const axios = require("axios");
const fs = require("fs");
const path = require("path");

const aiHttpClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://localhost:5000",
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
