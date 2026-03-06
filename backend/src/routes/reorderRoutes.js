const express = require("express");
const router = express.Router();

const { getReorderRecommendations } = require("../controllers/reorderController");

router.get("/reorder", getReorderRecommendations);

module.exports = router;