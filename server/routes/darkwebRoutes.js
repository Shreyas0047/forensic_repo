const express = require("express");
const { analyzeDarkweb, getAlerts, getHighAlerts } = require("../controllers/darkwebController");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/analyze", requireRole("ADMIN", "INVESTIGATOR"), analyzeDarkweb);
router.get("/alerts", requireRole("ADMIN", "INVESTIGATOR"), getAlerts);
router.get("/alerts/high", requireRole("ADMIN", "INVESTIGATOR"), getHighAlerts);

module.exports = router;
