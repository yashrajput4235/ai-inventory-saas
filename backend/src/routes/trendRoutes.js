const express = require("express");
const router = express.Router();

const { getDemandTrend } = require("../controllers/trendController");

router.get("/trend", getDemandTrend);

module.exports = router;