const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connectToDb");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "https://officeoftheprozoned.com",
  "https://www.officeoftheprozoned.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "NANS Southwest Zone D - KYS Portal Backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "NANS Southwest Zone D - KYS Portal Backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error("KYS Backend Error:", err);
  res.status(err.status || 500).json({
    status: "error",
    msg: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`KYS Server running on port ${PORT}`));
