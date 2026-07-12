import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    serialNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    acquisitionDate: {
      type: Date,
    },

    acquisitionCost: {
      type: Number,
      default: 0,
    },

    condition: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor", "Damaged"],
      default: "Good",
    },

    status: {
      type: String,
      enum: [
        "Available",
        "Allocated",
        "Reserved",
        "Under Maintenance",
        "Lost",
        "Retired",
        "Disposed",
      ],
      default: "Available",
    },

    shared: {
      type: Boolean,
      default: false,
    },

    image: {
      type: String,
      default: "",
    },

    documents: [
      {
        type: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Asset", assetSchema);