const express=require("express");
const router=express.Router();
const {authMiddleware}=require("../middleware/auth.middleware");
const {roleMiddleware}=require("../middleware/role.middleware");
const { getStoreSummary, getTopProducts,getLowStockProducts } = require("../controllers/analytics.controller");

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

router.get(
  "/low-stock/:storeId",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  getLowStockProducts
);

module.exports=router;