const express = require("express");
const { analyzeDarkweb, getAlerts, getHighAlerts } = require("../controllers/darkwebController");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/analyze", authorizeRoles("Admin", "Investigator"), analyzeDarkweb);
router.get("/alerts", authorizeRoles("Admin", "Investigator"), getAlerts);
router.get("/alerts/high", authorizeRoles("Admin", "Investigator"), getHighAlerts);

module.exports = router;
