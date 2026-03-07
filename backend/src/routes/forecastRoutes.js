const express=require("express");
const router=express.Router();

const {getForecast}=require("../controllers/forecastingController");
const {authMiddleware} = require("../middleware/auth.middleware");

router.get("/", authMiddleware, getForecast);

module.exports=router;
