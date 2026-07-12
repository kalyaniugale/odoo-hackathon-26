import express from "express";

import {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deactivateDepartment,
} from "../controllers/departmentController.js";

import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

router.use(auth);
router.use(role("Admin"));

router
    .route("/")
    .get(getDepartments)
    .post(createDepartment);

router
    .route("/:id")
    .get(getDepartmentById)
    .put(updateDepartment)
    .delete(deactivateDepartment);

export default router;