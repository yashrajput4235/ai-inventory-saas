const express = require("express");
const router = express.Router();

const { retrainModel } = require("../controllers/retrainController");

router.post("/retrain-model", retrainModel);

module.exports = router;