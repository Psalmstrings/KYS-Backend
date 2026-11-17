const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Admin = require("./models/admin");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to KYS DB successfully!");

  const adminCount = await Admin.countDocuments();
  console.log("KYS Admins count:", adminCount);

  if (adminCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin12345", salt);

    const admin = await Admin.create({
      fullName: "KYS Central Administrator",
      email: "kysadmin@officeoftheprozoned.com",
      password: hashedPassword,
      role: "superadmin"
    });
    console.log("Created initial KYS Admin: kysadmin@officeoftheprozoned.com / admin12345");
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
