const rateLimit= require("express-rate-limit");

// General Api rate limiter
exports.apiLimiter=rateLimit({
    windowMs:15 * 60 * 1000, // 15 minutes
    max: 100, // 100 request per ip
    message:{
        message: "Too many requests. Please try again later."
    }
});
// otp limiter
exports.otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 OTP requests per minute
  message: {
    message: "Too many OTP requests. Try again after 1 minute."
  }
});
// Login limiter
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: {
    message: "Too many login attempts. Try again later."
  }
});