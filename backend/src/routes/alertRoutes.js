const express=require("express");
const router=express.Router();
const {getLowStockAlerts}=require("../controllers/alertController");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/alerts", authMiddleware, getLowStockAlerts);

module.exports=router;