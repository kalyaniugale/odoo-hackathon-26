import express from "express";

import {
    createAllocation,
    getAllocations,
    getAllocationById,
    returnAsset,
    requestTransfer,
    approveTransfer,
} from "../controllers/allocationController.js";

import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

/* View Allocations */
router.get(
    "/",
    auth,
    role("Admin", "Asset Manager"),
    getAllocations
);

router.get(
    "/:id",
    auth,
    role("Admin", "Asset Manager"),
    getAllocationById
);

/* Allocate Asset */
router.post(
    "/",
    auth,
    role("Asset Manager"),
    createAllocation
);

/* Return Asset */
router.put(
    "/return/:id",
    auth,
    role("Asset Manager"),
    returnAsset
);

/* Employee requests transfer */
router.put(
    "/request-transfer/:id",
    auth,
    role("Employee"),
    requestTransfer
);

/* Approve Transfer */
router.put(
    "/approve-transfer/:id",
    auth,
    role("Asset Manager", "Department Head"),
    approveTransfer
);

export default router;