const express = require("express");
const router = express.Router();
const orgRoutes = require("./org.routes");

const authRoutes = require("./auth.routes");
const { authMiddleware } = require("../middleware/auth.middleware");

router.use("/auth", authRoutes);

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route working 🔐",
    user: req.user,
  });
});


router.use("/org", orgRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = router;