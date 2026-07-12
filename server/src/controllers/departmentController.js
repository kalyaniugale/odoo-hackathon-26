import asyncHandler from "express-async-handler";

import Department from "../models/Department.js";
import User from "../models/User.js";
import createNotification from "../utils/createNotification.js";
import createActivityLog from "../utils/createActivityLog.js";

export const createDepartment = asyncHandler(async (req, res) => {
    const { name, parentDepartment } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("Department name is required");
    }

    const exists = await Department.findOne({ name });

    if (exists) {
        res.status(400);
        throw new Error("Department already exists");
    }

    const department = await Department.create({
        name,
        parentDepartment: parentDepartment || null,
    });

    res.status(201).json({
        success: true,
        message: "Department created successfully",
        department,
    });
});

export const getDepartments = asyncHandler(async (req, res) => {
     const { status } = req.query;

const filter =
    status && status !== "All"
        ? { status }
        : status === "All"
        ? {}
        : { status: "Active" };

const departments = await Department.find(filter)
    .populate("departmentHead", "name email role")
    .populate("parentDepartment", "name")
    .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: departments.length,
        departments,
    });
});

export const getDepartmentById = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id)
        .populate("departmentHead", "name email role")
        .populate("parentDepartment", "name");

    if (!department || department.status === "Inactive") {
    res.status(404);
    throw new Error("Department not found");
}

    res.status(200).json({
        success: true,
        department,
    });
});

export const updateDepartment = asyncHandler(async (req, res) => {
    const {
        name,
        departmentHead,
        parentDepartment,
        status,
    } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
        res.status(404);
        throw new Error("Department not found");
    }

    if (departmentHead) {
        const head = await User.findById(departmentHead);

        if (!head) {
            res.status(404);
            throw new Error("Department Head not found");
        }

        if (head.role !== "Department Head") {
            res.status(400);
            throw new Error("Selected user is not a Department Head");
        }

        department.departmentHead = departmentHead;
    }

    department.name = name ?? department.name;
    department.parentDepartment =
        parentDepartment ?? department.parentDepartment;
    department.status = status ?? department.status;

    await department.save();

    const updatedDepartment = await Department.findById(department._id)
        .populate("departmentHead", "name email role")
        .populate("parentDepartment", "name");

    res.status(200).json({
        success: true,
        message: "Department updated successfully",
        department: updatedDepartment,
    });
});

export const deactivateDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        res.status(404);
        throw new Error("Department not found");
    }

    department.status = "Inactive";

    await department.save();

    res.status(200).json({
        success: true,
        message: "Department deactivated successfully",
    });
});