const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");

// Signup route (protected by key)
router.post("/signup", adminController.signup);

// Login route
router.post("/login", adminController.login);

// Profile
router.get("/profile", protect, adminController.getProfile);

module.exports = router;
