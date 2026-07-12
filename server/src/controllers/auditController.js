import asyncHandler from "express-async-handler";

import Audit from "../models/Audit.js";
import Asset from "../models/Asset.js";
import Department from "../models/department.js";

export const createAudit = asyncHandler(async (req, res) => {
    const {
        department,
        location,
        auditors,
        startDate,
        endDate,
    } = req.body;

    if (!department || !startDate || !endDate) {
        res.status(400);
        throw new Error("Required fields are missing");
    }

    const dept = await Department.findById(department);

    if (!dept || dept.status === "Inactive") {
        res.status(404);
        throw new Error("Department not found");
    }

    const assets = await Asset.find({
        department,
        ...(location && { location }),
    });

    const audit = await Audit.create({
        department,
        location,
        auditors,
        startDate,
        endDate,
        assets: assets.map(asset => ({
            asset: asset._id,
        })),
        createdBy: req.user._id,
    });

    const result = await Audit.findById(audit._id)
        .populate("department", "name")
        .populate("auditors", "name email")
        .populate("assets.asset", "assetTag name");

    res.status(201).json({
        success: true,
        message: "Audit cycle created successfully",
        audit: result,
    });
});

export const getAudits = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter =
        status && status !== "All"
            ? { status }
            : {};

    const audits = await Audit.find(filter)
        .populate("department", "name")
        .populate("auditors", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: audits.length,
        audits,
    });
});

export const getAuditById = asyncHandler(async (req, res) => {
    const audit = await Audit.findById(req.params.id)
        .populate("department", "name")
        .populate("createdBy", "name")
        .populate("auditors", "name email")
        .populate("assets.asset", "assetTag name status");

    if (!audit) {
        res.status(404);
        throw new Error("Audit not found");
    }

    res.status(200).json({
        success: true,
        audit,
    });
});

export const verifyAsset = asyncHandler(async (req, res) => {
    const { assetId, status, remarks } = req.body;

    const audit = await Audit.findById(req.params.id);

    if (!audit) {
        res.status(404);
        throw new Error("Audit not found");
    }

    if (audit.status === "Closed") {
        res.status(400);
        throw new Error("Audit cycle already closed");
    }

    const isAssignedAuditor = audit.auditors.some(
        auditor => auditor.toString() === req.user._id.toString()
    );

    if (!isAssignedAuditor) {
        res.status(403);
        throw new Error("You are not assigned to this audit");
    }

    const allowedStatus = ["Verified", "Missing", "Damaged"];

    if (!allowedStatus.includes(status)) {
        res.status(400);
        throw new Error("Invalid verification status");
    }

    const auditAsset = audit.assets.find(
        item => item.asset.toString() === assetId
    );

    if (!auditAsset) {
        res.status(404);
        throw new Error("Asset not found in this audit");
    }

    auditAsset.status = status;
    auditAsset.remarks = remarks || "";

    audit.discrepancies = audit.assets.filter(
        item => item.status === "Missing" || item.status === "Damaged"
    ).length;

    await audit.save();

    res.status(200).json({
        success: true,
        message: "Asset verification updated",
        audit,
    });
});

export const closeAudit = asyncHandler(async (req, res) => {
    const audit = await Audit.findById(req.params.id);

    if (!audit) {
        res.status(404);
        throw new Error("Audit not found");
    }

    if (audit.status === "Closed") {
        res.status(400);
        throw new Error("Audit already closed");
    }

    for (const item of audit.assets) {
        if (item.status === "Missing") {
            await Asset.findByIdAndUpdate(item.asset, {
                status: "Lost",
            });
        }
    }

    audit.discrepancies = audit.assets.filter(
        item =>
            item.status === "Missing" ||
            item.status === "Damaged"
    ).length;

    audit.status = "Closed";

    await audit.save();

    const updatedAudit = await Audit.findById(audit._id)
        .populate("department", "name")
        .populate("auditors", "name email")
        .populate("assets.asset", "assetTag name status");

    res.status(200).json({
        success: true,
        message: "Audit cycle closed successfully",
        audit: updatedAudit,
    });
});