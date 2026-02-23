const express = require("express");
const router = express.Router();
const { registerAdmin } = require("../controllers/org.controller");
const { otpLimiter } = require("../middleware/rateLimit.middleware");

router.post("/register-admin", otpLimiter, registerAdmin);

module.exports = router;