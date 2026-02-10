const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    dob: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    lgaOrigin: { type: String, required: true },
    stateOrigin: { type: String, required: true },
    address: { type: String, required: true },
    stateResidence: { type: String, required: true },
    institution: { type: String, required: true },
    course: { type: String, required: true },
    level: { type: String, required: true },
    receivedBursary: { type: Boolean, default: false }
});

module.exports = mongoose.model("Student", studentSchema);
