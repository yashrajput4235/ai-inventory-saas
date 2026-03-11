const express = require("express");
const router = express.Router();
const { getReorderRecommendations } = require("../controllers/reorderController");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/reorder", authMiddleware, getReorderRecommendations);

module.exports = router;