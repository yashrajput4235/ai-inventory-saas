const express=require("express");
const router=express.Router();

const {getForecast}=require("../controllers/forecastingController");

router.get("/",getForecast);

module.exports=router;
