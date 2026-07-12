import express from "express";

import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deactivateCategory,
} from "../controllers/categoryController.js";

import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

router.use(auth);
router.use(role("Admin"));

router
    .route("/")
    .get(getCategories)
    .post(createCategory);

router
    .route("/:id")
    .get(getCategoryById)
    .put(updateCategory)
    .delete(deactivateCategory);

export default router;