import dotenv from "dotenv";
import bcrypt from "bcrypt";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({
            role: "Admin",
        });

        if (adminExists) {
            console.log("Admin already exists.");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        const admin = await User.create({
            name: "System Admin",
            email: "admin@assetflow.com",
            password: hashedPassword,
            role: "Admin",
        });

        console.log("Admin created successfully.");
        console.log(admin);

        process.exit();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

seedAdmin();