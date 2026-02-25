const express = require("express");
const router = express.Router();

const { createSale } = require("../controllers/sales.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  createSale
);

module.exports = router;