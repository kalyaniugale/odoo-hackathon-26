import asyncHandler from "express-async-handler";

import Asset from "../models/Asset.js";
import Allocation from "../models/Allocation.js";
import Booking from "../models/Booking.js";
import Maintenance from "../models/Maintenance.js";
import Audit from "../models/Audit.js";
import Department from "../models/Department.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

export const getDashboard = asyncHandler(async (req, res) => {
    const role = req.user.role;

    if (role === "Admin") {
        const [
            availableAssets,
            allocatedAssets,
            maintenanceToday,
            activeBookings,
            pendingTransfers,
            upcomingReturns,
            overdueReturns,
            departments,
            employees,
            categories,
            openAudits,
        ] = await Promise.all([
            Asset.countDocuments({ status: "Available" }),

            Asset.countDocuments({ status: "Allocated" }),

            Maintenance.countDocuments({
                createdAt: {
                    $gte: new Date(
                        new Date().setHours(0, 0, 0, 0)
                    ),
                },
            }),

            Booking.countDocuments({
                status: {
                    $in: ["Upcoming", "Ongoing"],
                },
            }),

            Allocation.countDocuments({
                status: "Transfer Requested",
            }),

            Allocation.countDocuments({
                status: "Allocated",
                expectedReturnDate: {
                    $gte: new Date(),
                },
            }),

            Allocation.countDocuments({
                status: "Allocated",
                expectedReturnDate: {
                    $lt: new Date(),
                },
            }),

            Department.countDocuments({
                status: "Active",
            }),

            User.countDocuments({
                status: "Active",
            }),

            Category.countDocuments({
                status: "Active",
            }),

            Audit.countDocuments({
                status: "Open",
            }),
        ]);

        return res.status(200).json({
            success: true,
            role,
            dashboard: {
                availableAssets,
                allocatedAssets,
                maintenanceToday,
                activeBookings,
                pendingTransfers,
                upcomingReturns,
                overdueReturns,
                departments,
                employees,
                categories,
                openAudits,
            },
        });
    }
        if (role === "Asset Manager") {
        const [
            availableAssets,
            allocatedAssets,
            maintenanceRequests,
            assetsUnderMaintenance,
            pendingTransfers,
            upcomingReturns,
            overdueReturns,
        ] = await Promise.all([
            Asset.countDocuments({ status: "Available" }),

            Asset.countDocuments({ status: "Allocated" }),

            Maintenance.countDocuments({
                status: "Pending",
            }),

            Asset.countDocuments({
                status: "Under Maintenance",
            }),

            Allocation.countDocuments({
                status: "Transfer Requested",
            }),

            Allocation.countDocuments({
                status: "Allocated",
                expectedReturnDate: {
                    $gte: new Date(),
                },
            }),

            Allocation.countDocuments({
                status: "Allocated",
                expectedReturnDate: {
                    $lt: new Date(),
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            role,
            dashboard: {
                availableAssets,
                allocatedAssets,
                maintenanceRequests,
                assetsUnderMaintenance,
                pendingTransfers,
                upcomingReturns,
                overdueReturns,
            },
        });
    }

    if (role === "Department Head") {
        const department = req.user.department;

        const [
            departmentAssets,
            departmentEmployees,
            departmentBookings,
            pendingTransfers,
            upcomingReturns,
            maintenanceRequests,
        ] = await Promise.all([
            Asset.countDocuments({ department }),

            User.countDocuments({
                department,
                status: "Active",
            }),

            Booking.countDocuments({
                status: {
                    $in: ["Upcoming", "Ongoing"],
                },
            }),

            Allocation.countDocuments({
                status: "Transfer Requested",
            }),

            Allocation.countDocuments({
                status: "Allocated",
                expectedReturnDate: {
                    $gte: new Date(),
                },
            }),

            Maintenance.countDocuments({
                status: "Pending",
            }),
        ]);

        return res.status(200).json({
            success: true,
            role,
            dashboard: {
                departmentAssets,
                departmentEmployees,
                departmentBookings,
                pendingTransfers,
                upcomingReturns,
                maintenanceRequests,
            },
        });
    }

    if (role === "Employee") {
        const [
            allocatedAssets,
            myBookings,
            myMaintenanceRequests,
            upcomingReturns,
        ] = await Promise.all([
            Allocation.countDocuments({
                allocatedTo: req.user._id,
                status: {
                    $in: [
                        "Allocated",
                        "Transferred",
                        "Transfer Requested",
                    ],
                },
            }),

            Booking.countDocuments({
                bookedBy: req.user._id,
                status: {
                    $in: ["Upcoming", "Ongoing"],
                },
            }),

            Maintenance.countDocuments({
                raisedBy: req.user._id,
                status: {
                    $ne: "Resolved",
                },
            }),

            Allocation.countDocuments({
                allocatedTo: req.user._id,
                status: "Allocated",
                expectedReturnDate: {
                    $gte: new Date(),
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            role,
            dashboard: {
                allocatedAssets,
                myBookings,
                myMaintenanceRequests,
                upcomingReturns,
            },
        });
    }

    res.status(403);
    throw new Error("Invalid user role");
});