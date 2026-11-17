const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

// Create JWT token
const createToken = (id, role = "kyc_admin") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Signup controller (Protected: requires setup key or existing admin)
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, setupKey } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: "error",
        msg: "Please provide all required fields",
      });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      const validKey = process.env.ADMIN_SETUP_KEY || "KYS_ADMIN_SECRET_KEY_2026";
      if (!setupKey || setupKey !== validKey) {
        return res.status(403).json({
          status: "error",
          msg: "Unauthorized: Admin signup is restricted. Setup authorization key required.",
        });
      }
    }

    // Check if admin already exists
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        status: "error",
        msg: "Admin with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await Admin.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: adminCount === 0 ? "superadmin" : "kyc_admin",
    });

    res.status(201).json({
      status: "success",
      msg: "Signup successful",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      msg: err.message,
    });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        msg: "Email and password are required",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(400).json({
        status: "error",
        msg: "Invalid email or password",
      });
    }

    if (admin.isActive === false) {
      return res.status(403).json({
        status: "error",
        msg: "This administrative account is disabled.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        msg: "Invalid email or password",
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = createToken(admin._id, admin.role);

    res.status(200).json({
      status: "success",
      msg: "Login successful",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      msg: err.message,
    });
  }
};

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      admin: req.user,
    });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
};
