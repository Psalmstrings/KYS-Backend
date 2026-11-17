const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const getMongoUri = () => {
    const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!rawUri) return "";
    return rawUri.trim().replace(/^["']|["']$/g, "");
};

const connectDB = async () => {
    const uri = getMongoUri();
    if (!uri) {
        console.error(
            "❌ [MongoDB Error] Neither MONGO_URI nor MONGODB_URI is set in environment variables!"
        );
        process.exit(1);
    }

    const maskedUri = uri.replace(
        /\/\/(.*?):(.*?)@/,
        "//$1:********@"
    );

    try {
        await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected Successfully to: ${maskedUri}`);
    } catch (err) {
        console.error(`❌ MongoDB Connection Error (${maskedUri}):`, err.message);
        if (err.code === 8000 || (err.message && err.message.includes("bad auth"))) {
            console.error(
                "💡 Hint: Atlas rejected the database username or password. Update MONGO_URI in Render Environment settings."
            );
        }
        process.exit(1);
    }
};

module.exports = connectDB;
