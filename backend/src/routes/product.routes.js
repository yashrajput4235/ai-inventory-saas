const express = require("express");
const router = express.Router();

const { createProduct, getProducts } = require("../controllers/product.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");

// Admin Only
router.post(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    createProduct
);

// Admin + Manager
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  getProducts
);

module.exports = router;