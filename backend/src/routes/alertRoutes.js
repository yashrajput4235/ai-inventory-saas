const express=require("express");
const router=express.Router();
const {getLowStockAlerts}=require("../controllers/alertController");

router.get("/alerts",getLowStockAlerts);

module.exports=router;