const express = require("express");
const router = express.Router();
const { registerUser, verifyOtp, loginUser , resendOtp, forgotPassword,
  resetPassword,logoutUser} = require("../controllers/auth.controller");
const { otpLimiter, loginLimiter } = require("../middleware/rateLimit.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/register",otpLimiter ,registerUser);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/login", loginLimiter, loginUser);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", otpLimiter, resetPassword);
router.post("/logout", authMiddleware, logoutUser);

router.get(
    "/admin-dashboard",
    authMiddleware,
    roleMiddleware(["admin"]),
    (req,res)=>{
        res.json({message:"Admin dashboard"});
    }
);

router.get(
    "/manager-dashboard",
    authMiddleware,
    roleMiddleware(["manager"]),
    (req,res)=>{
        res.json({message:"Manager dashboard"});
    }
);



module.exports = router;