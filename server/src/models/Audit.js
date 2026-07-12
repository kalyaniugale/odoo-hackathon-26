import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    auditors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assets: [
      {
        asset: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Asset",
        },

        status: {
          type: String,
          enum: ["Verified", "Missing", "Damaged"],
          default: "Verified",
        },

        remarks: {
          type: String,
          default: "",
        },
      },
    ],

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },

    discrepancies: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Audit", auditSchema);