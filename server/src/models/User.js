import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: [
                "Admin",
                "Asset Manager",
                "Department Head",
                "Employee",
            ],
            default: "Employee",
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null,
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },

        resetPasswordToken: {
            type: String,
            default: null,
        },

        resetPasswordExpire: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);