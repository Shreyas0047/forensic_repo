const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const blockchainRoutes = require("./routes/blockchainRoutes");
const auditRoutes = require("./routes/auditRoutes");
const darkwebRoutes = require("./routes/darkwebRoutes");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const { sanitizeRequest } = require("./middleware/validationMiddleware");
const { authenticateUser } = require("./middleware/authMiddleware");
const { ensureUploadsDirectory } = require("./utils/storagePaths");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);
app.use(requestLogger);
app.use("/uploads", express.static(ensureUploadsDirectory()));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "forensics-server",
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/cases", authenticateUser, caseRoutes);
app.use("/api/evidence", authenticateUser, evidenceRoutes);
app.use("/api/analysis", authenticateUser, analysisRoutes);
app.use("/api/intelligence", authenticateUser, intelligenceRoutes);
app.use("/api/blockchain", authenticateUser, blockchainRoutes);
app.use("/api/audit", authenticateUser, auditRoutes);
app.use("/api/darkweb", authenticateUser, darkwebRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use(errorHandler);

module.exports = app;
