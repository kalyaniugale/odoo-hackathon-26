import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        departmentHead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        parentDepartment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Department", departmentSchema);