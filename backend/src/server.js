require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const routes = require("./routes");

const app = express();

// CORS (important for cookies)
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Apply rate limiter to API
app.use("/api", apiLimiter);

// Routes
app.use("/api", routes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});