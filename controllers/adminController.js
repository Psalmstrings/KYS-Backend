const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                status: "error",
                msg: "Please provide all required fields"
            });
        }

        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(400).json({
                status: "error",
                msg: "Admin with this email already exists"
            });
        }

        const admin = await Admin.create({ fullName, email, password });

        res.status(201).json({
            status: "success",
            msg: "Signup successful",
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email
            }
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            msg: err.message
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({
                status: "error",
                msg: "Email not found"
            });
        }

        // const isMatch = await bcrypt.compare(password, admin.password);

        // if (!isMatch) {
        //     return res.status(400).json({
        //         status: "error",
        //         msg: "Password is incorrect"
        //     });
        // }

        const token = createToken(admin._id);

        res.status(200).json({
            status: "success",
            msg: "Login successful",
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email
            },
            token
        });

    } catch (err) {
        res.status(500).json({
            status: "error",
            msg: err.message
        });
    }
};

