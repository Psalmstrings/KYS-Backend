const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ status: "error", msg: "Not authenticated. Token required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Fallback: Check Central Admin Blog JWT Secret
      const blogSecret = process.env.BLOG_JWT_SECRET || "jkaskvhalvcjhasvchasdcv";
      decoded = jwt.verify(token, blogSecret);
    }

    if (!decoded) {
      return res.status(401).json({ status: "error", msg: "Invalid token signature." });
    }

    // Try finding admin in KYS DB
    let admin = await Admin.findById(decoded.id).select("-password");

    // If not found in KYS Admin collection but token is valid admin from Central CMS
    if (!admin && (decoded.role === "admin" || decoded.role === "superadmin")) {
      admin = {
        _id: decoded.id,
        fullName: decoded.name || "Central Administrator",
        email: decoded.email,
        role: decoded.role,
        isActive: true
      };
    }

    if (!admin || admin.isActive === false) {
      return res.status(401).json({ status: "error", msg: "Invalid or inactive administrative account." });
    }

    req.user = admin;
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", msg: "Invalid or expired token." });
  }
};

module.exports = { protect };
