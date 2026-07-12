import asyncHandler from "express-async-handler";

import Allocation from "../models/Allocation.js";
import Asset from "../models/Asset.js";
import User from "../models/User.js";

export const createAllocation = asyncHandler(async (req, res) => {
    const {
        asset,
        allocatedTo,
        expectedReturnDate,
        notes,
    } = req.body;

    if (!asset || !allocatedTo) {
        res.status(400);
        throw new Error("Asset and Employee are required");
    }

    const selectedAsset = await Asset.findById(asset);

    if (!selectedAsset) {
        res.status(404);
        throw new Error("Asset not found");
    }

    if (selectedAsset.status !== "Available") {
        res.status(400);
        throw new Error("Asset is not available");
    }

    const employee = await User.findById(allocatedTo);

    if (!employee || employee.status !== "Active") {
        res.status(404);
        throw new Error("Employee not found");
    }

    const allocation = await Allocation.create({
        asset,
        allocatedTo,
        allocatedBy: req.user._id,
        expectedReturnDate,
        notes,
    });

    selectedAsset.status = "Allocated";
    await selectedAsset.save();

    const result = await Allocation.findById(allocation._id)
        .populate("asset", "assetTag name")
        .populate("allocatedTo", "name email")
        .populate("allocatedBy", "name");

    res.status(201).json({
        success: true,
        message: "Asset allocated successfully",
        allocation: result,
    });
});

export const getAllocations = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter =
        status && status !== "All"
            ? { status }
            : status === "All"
            ? {}
            : {
                  status: {
                      $in: [
                          "Allocated",
                          "Transfer Requested",
                          "Transferred",
                      ],
                  },
              };

    const allocations = await Allocation.find(filter)
        .populate("asset", "assetTag name status")
        .populate("allocatedTo", "name email")
        .populate("allocatedBy", "name")
        .populate("approvedBy", "name")
        .populate("transferTo", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: allocations.length,
        allocations,
    });
});

export const getAllocationById = asyncHandler(async (req, res) => {
    const allocation = await Allocation.findById(req.params.id)
        .populate("asset")
        .populate("allocatedTo", "name email")
        .populate("allocatedBy", "name")
        .populate("approvedBy", "name")
        .populate("transferTo", "name email");

    if (!allocation) {
        res.status(404);
        throw new Error("Allocation not found");
    }

    res.status(200).json({
        success: true,
        allocation,
    });
});

export const returnAsset = asyncHandler(async (req, res) => {
    const { returnCondition, notes } = req.body;

    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
        res.status(404);
        throw new Error("Allocation not found");
    }

    if (allocation.status === "Returned") {
        res.status(400);
        throw new Error("Asset already returned");
    }

    const asset = await Asset.findById(allocation.asset);

    allocation.status = "Returned";
    allocation.actualReturnDate = new Date();
    allocation.returnCondition = returnCondition || "";
    allocation.notes = notes || allocation.notes;

    await allocation.save();

    asset.status = "Available";
    await asset.save();

    res.status(200).json({
        success: true,
        message: "Asset returned successfully",
        allocation,
    });
});

export const requestTransfer = asyncHandler(async (req, res) => {
    const { transferTo } = req.body;

    if (!transferTo) {
        res.status(400);
        throw new Error("Transfer employee is required");
    }

    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
        res.status(404);
        throw new Error("Allocation not found");
    }

    if (allocation.status === "Returned") {
        res.status(400);
        throw new Error("Returned assets cannot be transferred");
    }

    if (allocation.transferRequested) {
        res.status(400);
        throw new Error("Transfer already requested");
    }

    const employee = await User.findById(transferTo);

    if (!employee || employee.status !== "Active") {
        res.status(404);
        throw new Error("Employee not found");
    }

    allocation.transferRequested = true;
    allocation.transferTo = transferTo;
    allocation.status = "Transfer Requested";

    await allocation.save();

    res.status(200).json({
        success: true,
        message: "Transfer request submitted",
        allocation,
    });
});

export const approveTransfer = asyncHandler(async (req, res) => {
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
        res.status(404);
        throw new Error("Allocation not found");
    }

    if (!allocation.transferRequested || !allocation.transferTo) {
        res.status(400);
        throw new Error("No transfer request found");
    }

    allocation.allocatedTo = allocation.transferTo;
    allocation.transferRequested = false;
    allocation.transferTo = null;
    allocation.approvedBy = req.user._id;
    allocation.status = "Transferred";

    await allocation.save();

    const updatedAllocation = await Allocation.findById(allocation._id)
        .populate("asset", "assetTag name")
        .populate("allocatedTo", "name email")
        .populate("allocatedBy", "name")
        .populate("approvedBy", "name");

    res.status(200).json({
        success: true,
        message: "Transfer approved successfully",
        allocation: updatedAllocation,
    });
});