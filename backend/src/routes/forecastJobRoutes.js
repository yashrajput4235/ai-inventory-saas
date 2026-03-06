const express=require("express");
const router=express.Router();

const {runDailyForecast}=require("../controllers/forecastJobController");

router.post("/run-forecast",runDailyForecast);

module.exports=router;
