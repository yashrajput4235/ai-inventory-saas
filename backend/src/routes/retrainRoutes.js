const express = require("express");
const router = express.Router();

const { retrainModel } = require("../controllers/retrainController");
const { cronAuth } = require("../middleware/cron.middleware");

router.get("/retrain-model", cronAuth, retrainModel);

module.exports = router;