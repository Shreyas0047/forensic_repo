const fs = require("fs");
const path = require("path");

const uploadsRoot = path.resolve(
  process.env.EVIDENCE_UPLOAD_DIR || path.join(__dirname, "..", "uploads"),
);

function ensureUploadsDirectory() {
  fs.mkdirSync(uploadsRoot, { recursive: true });
  return uploadsRoot;
}

module.exports = {
  uploadsRoot,
  ensureUploadsDirectory,
};
