import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expectedReturnDate: {
      type: Date,
    },

    actualReturnDate: {
      type: Date,
    },

    transferRequested: {
      type: Boolean,
      default: false,
    },

    transferTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Allocated",
        "Transfer Requested",
        "Transferred",
        "Returned",
      ],
      default: "Allocated",
    },

    returnCondition: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Allocation", allocationSchema);