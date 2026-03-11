const express = require("express");
const router = express.Router();
const { getDashboard, getOrgDashboard } = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");

router.get("/dashboard", authMiddleware, getDashboard);
router.get("/dashboard/org", authMiddleware, roleMiddleware(["admin"]), getOrgDashboard);

module.exports = router;