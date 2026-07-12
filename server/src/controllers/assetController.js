import asyncHandler from "express-async-handler";

import Asset from "../models/Asset.js";
import generateAssetTag from "../utils/generateAssetTag.js";

import Allocation from "../models/Allocation.js";
import Maintenance from "../models/Maintenance.js";
export const createAsset = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        serialNumber,
        department,
        location,
        acquisitionDate,
        acquisitionCost,
        condition,
        shared,
    } = req.body;

    if (!name || !category || !location) {
        res.status(400);
        throw new Error("Required fields are missing");
    }

    if (serialNumber) {
        const exists = await Asset.findOne({ serialNumber });

        if (exists) {
            res.status(400);
            throw new Error("Serial Number already exists");
        }
    }

    const asset = await Asset.create({
        assetTag: await generateAssetTag(),
        name,
        category,
        serialNumber,
        department,
        location,
        acquisitionDate,
        acquisitionCost,
        condition,
        shared,
        image: req.files?.image?.[0]?.filename || "",
        documents:req.files?.documents?.map(file => file.filename) || [],
        createdBy: req.user._id,
    });

    res.status(201).json({
        success: true,
        message: "Asset registered successfully",
        asset,
    });
});

export const getAssets = asyncHandler(async (req, res) => {
    const {
        status,
        category,
        department,
        location,
        assetTag,
        serialNumber,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (location) filter.location = location;
    if (assetTag) filter.assetTag = assetTag;
    if (serialNumber) filter.serialNumber = serialNumber;

    const assets = await Asset.find(filter)
        .populate("category", "name")
        .populate("department", "name")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: assets.length,
        assets,
    });
});

export const getAssetById = asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id)
        .populate("category", "name")
        .populate("department", "name")
        .populate("createdBy", "name");

    if (!asset) {
        res.status(404);
        throw new Error("Asset not found");
    }

    const allocationHistory = await Allocation.find({
        asset: asset._id,
    })
        .populate("allocatedTo", "name email")
        .populate("allocatedBy", "name")
        .sort({ createdAt: -1 });

    const maintenanceHistory = await Maintenance.find({
        asset: asset._id,
    })
        .populate("raisedBy", "name")
        .populate("approvedBy", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        asset,
        allocationHistory,
        maintenanceHistory,
    });
});

export const updateAsset = asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
        res.status(404);
        throw new Error("Asset not found");
    }

    Object.assign(asset, req.body);

    if (req.file) {
        asset.image = req.file.filename;
    }

    await asset.save();

    res.status(200).json({
        success: true,
        message: "Asset updated successfully",
        asset,
    });
});

export const deleteAsset = asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
        res.status(404);
        throw new Error("Asset not found");
    }

    asset.status = "Disposed";

    await asset.save();

    res.status(200).json({
        success: true,
        message: "Asset disposed successfully",
    });
});