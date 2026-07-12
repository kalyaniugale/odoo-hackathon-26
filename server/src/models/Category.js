import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        warrantyPeriod: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Category", categorySchema);