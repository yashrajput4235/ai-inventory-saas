const express = require("express");
const router = express.Router();
const { registerAdmin, addStoreManager } = require("../controllers/org.controller");
const { otpLimiter } = require("../middleware/rateLimit.middleware");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");

router.post("/register-admin", otpLimiter, registerAdmin);
router.post(
  "/add-manager", 
  authMiddleware, 
  roleMiddleware(["admin"]), 
  addStoreManager
);

module.exports = router;