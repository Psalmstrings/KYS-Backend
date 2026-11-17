const Student = require("../models/student");

// CREATE STUDENT REGISTRATION (Public)
exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      status: "success",
      msg: "Registration successful! Welcome to the KYS family.",
      data: {
        id: student._id,
        registrationId: student.registrationId,
        fullName: student.fullName,
        email: student.email,
        institution: student.institution,
        stateOrigin: student.stateOrigin,
        verificationStatus: student.verificationStatus,
        createdAt: student.createdAt,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: "error",
        msg: "A student with this email address or phone number is already registered.",
      });
    }
    res.status(400).json({ status: "error", msg: err.message });
  }
};

// PUBLIC STATUS LOOKUP (Safe: does not leak sensitive private info)
exports.verifyStudentStatus = async (req, res) => {
  try {
    const { identifier } = req.body; // registrationId, email, or phone

    if (!identifier) {
      return res.status(400).json({ status: "error", msg: "Please provide your Registration ID, Email, or Phone number." });
    }

    const trimmed = identifier.trim();
    const student = await Student.findOne({
      $or: [
        { registrationId: trimmed.toUpperCase() },
        { email: trimmed.toLowerCase() },
        { phone: trimmed },
      ],
    }).select("registrationId fullName institution course level stateOrigin verificationStatus verifiedAt createdAt");

    if (!student) {
      return res.status(404).json({
        status: "error",
        msg: "No student registration found matching these details. Please check and try again.",
      });
    }

    res.status(200).json({
      status: "success",
      student,
    });
  } catch (err) {
    res.status(500).json({ status: "error", msg: "Server error during verification lookup" });
  }
};

// GET ALL STUDENTS (Admin Only, Paginated & Searchable)
exports.getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, stateOrigin, institution, level, verificationStatus } = req.query;
    const filter = {};

    if (stateOrigin) filter.stateOrigin = stateOrigin;
    if (institution) filter.institution = { $regex: institution, $options: "i" };
    if (level) filter.level = level;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { registrationId: { $regex: search, $options: "i" } },
        { matricNo: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [students, total] = await Promise.all([
      Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: students,
    });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
};

// GET SINGLE STUDENT DETAILS (Admin Only)
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ status: "error", msg: "Student not found" });
    res.status(200).json({ status: "success", data: student });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
};

// VERIFY STUDENT (Admin Only)
exports.verifyStudent = async (req, res) => {
  try {
    const { verificationStatus, remarks } = req.body;

    if (!["Pending", "Verified", "Rejected"].includes(verificationStatus)) {
      return res.status(400).json({ status: "error", msg: "Invalid verification status" });
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus,
        remarks: remarks || "",
        verifiedAt: verificationStatus === "Verified" ? new Date() : null,
        verifiedBy: req.user?._id,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ status: "error", msg: "Student not found" });

    res.status(200).json({
      status: "success",
      msg: `Student marked as ${verificationStatus}`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
};

// GET KYC STATISTICS (Admin Only)
exports.getStats = async (req, res) => {
  try {
    const [total, verified, pending, rejected] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ verificationStatus: "Verified" }),
      Student.countDocuments({ verificationStatus: "Pending" }),
      Student.countDocuments({ verificationStatus: "Rejected" }),
    ]);

    // Breakdown by state
    const byState = await Student.aggregate([
      { $group: { _id: "$stateOrigin", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      stats: {
        total,
        verified,
        pending,
        rejected,
        byState,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
};

// DELETE STUDENT (Admin Only)
exports.deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ status: "error", msg: "Student not found" });
    res.status(200).json({ status: "success", msg: "Student record deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
};

// Legacy Filter Endpoints (Protected)
exports.getStudentByState = async (req, res) => {
  try {
    const students = await Student.find({ stateOrigin: req.params.stateOrigin });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: "No student in this state" });
  }
};

exports.getStudentByLga = async (req, res) => {
  try {
    const students = await Student.find({ lgaOrigin: req.params.lgaOrigin });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: "No student in this Local Government" });
  }
};

exports.getStudentBySchool = async (req, res) => {
  try {
    const students = await Student.find({ institution: req.params.institution });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: "No student in this institution" });
  }
};

exports.getStudentByStateResidence = async (req, res) => {
  try {
    const students = await Student.find({ stateResidence: req.params.stateResidence });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: "No student in this state of residence" });
  }
};
