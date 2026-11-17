const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    lgaOrigin: {
      type: String,
      required: true,
      trim: true,
    },
    stateOrigin: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    stateResidence: {
      type: String,
      required: true,
      trim: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["100", "200", "300", "400", "500", "600", "Other"],
    },
    matricNo: {
      type: String,
      trim: true,
      default: "",
    },
    receivedBursary: {
      type: Boolean,
      default: false,
    },
    passportPhoto: {
      type: String,
      default: "",
    },
    idCardImage: {
      type: String,
      default: "",
    },
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
      index: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Pre-save hook in Mongoose 9
studentSchema.pre("save", function () {
  if (!this.registrationId) {
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    this.registrationId = `KYS-ZD-${new Date().getFullYear()}-${randomPart}`;
  }
});

module.exports = mongoose.model("Student", studentSchema);
