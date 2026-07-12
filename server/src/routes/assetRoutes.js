import express from "express";

import {
    createAsset,
    getAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
} from "../controllers/assetController.js";

import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Everyone can view assets
router.get("/", auth, getAssets);

router.get("/:id", auth, getAssetById);

// Only Asset Manager can manage assets
router.post(
    "/",
    auth,
    role("Asset Manager"),
    upload.fields([
        {
            name: "image",
            maxCount: 1,
        },
        {
            name: "documents",
            maxCount: 10,
        },
    ]),
    createAsset
);

router.put(
    "/:id",
    auth,
    role("Asset Manager"),
    upload.fields([
        {
            name: "image",
            maxCount: 1,
        },
        {
            name: "documents",
            maxCount: 10,
        },
    ]),
    updateAsset
);

router.delete(
    "/:id",
    auth,
    role("Asset Manager"),
    deleteAsset
);

export default router;