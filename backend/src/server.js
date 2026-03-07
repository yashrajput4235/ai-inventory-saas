require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const forecastRoutes = require("./routes/forecastRoutes");
const routes = require("./routes");
const alertRoutes = require("./routes/alertRoutes");
const forecastJobRoutes = require("./routes/forecastJobRoutes");
const reorderRoutes = require("./routes/reorderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const trendRoutes = require("./routes/trendRoutes");
const retrainRoutes = require("./routes/retrainRoutes");







const app = express();

// CORS (important for cookies)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Debug logger for all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

// Apply rate limiter to API
app.use("/api", apiLimiter);

// Routes
app.use("/api", routes);
app.use("/api", forecastRoutes);
app.use("/api", alertRoutes);
app.use("/api", forecastJobRoutes);
app.use("/api", reorderRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", trendRoutes);
app.use("/api", retrainRoutes);
const PORT = process.env.PORT || 5001;
console.log("PROJECT:", process.env.BIGQUERY_PROJECT_ID);
console.log("HAS CREDS:", !!process.env.GOOGLE_CREDENTIALS);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});