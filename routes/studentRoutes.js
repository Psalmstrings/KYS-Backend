const express = require("express");
const {
  createStudent,
  verifyStudentStatus,
  getStudents,
  getStudentById,
  verifyStudent,
  getStats,
  deleteStudent,
  getStudentByLga,
  getStudentBySchool,
  getStudentByState,
  getStudentByStateResidence,
} = require("../controllers/studentController");
const checkExistingStudent = require("../middlewares/checkExistingStudent");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/", checkExistingStudent, createStudent);
router.post("/verify-status", verifyStudentStatus);
router.get("/stats", getStats);

// Admin protected routes
router.get("/", protect, getStudents);
router.get("/:id", protect, getStudentById);
router.put("/:id/verify", protect, verifyStudent);
router.delete("/:id", protect, deleteStudent);

// Legacy filter routes (protected)
router.get("/state/:stateOrigin", protect, getStudentByState);
router.get("/lga/:lgaOrigin", protect, getStudentByLga);
router.get("/school/:institution", protect, getStudentBySchool);
router.get("/residence/:stateResidence", protect, getStudentByStateResidence);

module.exports = router;
