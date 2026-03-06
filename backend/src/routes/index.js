const express = require("express");
const router = express.Router();
const orgRoutes = require("./org.routes");

const authRoutes = require("./auth.routes");
const { authMiddleware } = require("../middleware/auth.middleware");

const storeRoutes = require("./store.routes");
const productRoutes = require("./product.routes");

const inventoryRoutes = require("./inventory.routes");
const salesRoutes = require("./sales.routes");

const analyticsRoutes = require("./analytics.routes");

router.use("/auth", authRoutes);



router.use("/stores", storeRoutes);

router.use("/inventory", inventoryRoutes);

router.use("/products", productRoutes);

router.use("/sales", salesRoutes);

router.use("/org", orgRoutes);

router.use("/analytics", analyticsRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = router;