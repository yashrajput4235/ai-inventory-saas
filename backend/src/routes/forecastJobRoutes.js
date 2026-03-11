const express=require("express");
const router=express.Router();

const {runDailyForecast}=require("../controllers/forecastJobController");
const {cronAuth} = require("../middleware/cron.middleware");

router.all("/run-forecast", cronAuth, runDailyForecast);

module.exports=router;
