import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/uploadFile.js";

export const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const exists = await User.findOne({ email });

    if (exists) {
        res.status(400);
        throw new Error("Email already exists");
    }

    const user = await User.create({
        name,
        email,
        password: await bcrypt.hash(password, 10),
    });

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
        },
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate(
        "department",
        "name"
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    res.status(200).json({
        success: true,
        message: "Login successful",
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
        },
    });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/auth/reset-password/${resetToken}`;

    await sendEmail(
        user.email,
        "AssetFlow Password Reset",
        `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
        `
    );

    res.status(200).json({
        success: true,
        message: "Password reset email sent",
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        res.status(400);
        throw new Error("Password is required");
    }

    const token = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error("Invalid or expired reset token");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successful",
    });
});

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .populate("department", "name");

    res.status(200).json({
        success: true,
        user,
    });
});