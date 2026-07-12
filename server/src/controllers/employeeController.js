import asyncHandler from "express-async-handler";

import User from "../models/User.js";
import Department from "../models/Department.js";

export const getEmployees = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter =
        status && status !== "All"
            ? { status }
            : status === "All"
            ? {}
            : { status: "Active" };

    const employees = await User.find(filter)
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .populate("department", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: employees.length,
        employees,
    });
});

export const getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await User.findById(req.params.id)
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .populate("department", "name departmentHead");

    if (!employee || employee.status === "Inactive") {
        res.status(404);
        throw new Error("Employee not found");
    }

    res.status(200).json({
        success: true,
        employee,
    });
});

export const updateEmployee = asyncHandler(async (req, res) => {
    const { name, email, department, status } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee) {
        res.status(404);
        throw new Error("Employee not found");
    }

    if (department) {
        const dept = await Department.findById(department);

        if (!dept || dept.status === "Inactive") {
            res.status(404);
            throw new Error("Department not found");
        }

        employee.department = department;
    }

    employee.name = name ?? employee.name;
    employee.email = email ?? employee.email;
    employee.status = status ?? employee.status;

    await employee.save();

    const updatedEmployee = await User.findById(employee._id)
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .populate("department", "name");

    res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        employee: updatedEmployee,
    });
});

export const promoteEmployee = asyncHandler(async (req, res) => {
    const { role, departmentId } = req.body;

    if (!["Department Head", "Asset Manager"].includes(role)) {
        res.status(400);
        throw new Error("Invalid role");
    }

    const employee = await User.findById(req.params.id);

    if (!employee) {
        res.status(404);
        throw new Error("Employee not found");
    }

    employee.role = role;

    if (departmentId) {
        const department = await Department.findById(departmentId);

        if (!department || department.status === "Inactive") {
            res.status(404);
            throw new Error("Department not found");
        }

        employee.department = department._id;

        if (role === "Department Head") {
            department.departmentHead = employee._id;
            await department.save();
        }
    }

    await employee.save();

    const updatedEmployee = await User.findById(employee._id)
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .populate("department", "name");

    res.status(200).json({
        success: true,
        message: `${role} assigned successfully`,
        employee: updatedEmployee,
    });
});

export const deactivateEmployee = asyncHandler(async (req, res) => {
    const employee = await User.findById(req.params.id);

    if (!employee) {
        res.status(404);
        throw new Error("Employee not found");
    }

    employee.status = "Inactive";

    await employee.save();

    res.status(200).json({
        success: true,
        message: "Employee deactivated successfully",
    });
});