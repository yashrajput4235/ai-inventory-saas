const express=require("express");
const router=express.Router();
const {authMiddleware}=require("../middleware/auth.middleware");
const {roleMiddleware}=require("../middleware/role.middleware");
const { getStoreSummary, getTopProducts } = require("../controllers/analytics.controller");

router.get(
    "/store-summary/:storeId",
    authMiddleware,
    roleMiddleware(["admin","manager"]),
    getStoreSummary);

router.get(
  "/top-products/:storeId",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  getTopProducts
);

module.exports=router;