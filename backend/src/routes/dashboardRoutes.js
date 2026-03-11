const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/dashboard", authMiddleware, getDashboard);

module.exports = router;