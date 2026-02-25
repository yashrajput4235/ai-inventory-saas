const express = require("express");
const router = express.Router();

const { addStock, getStoreInventory } = require("../controllers/inventory.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");

router.post(
  "/add-stock",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  addStock
);

router.get(
  "/:storeId",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  getStoreInventory
);

module.exports = router;