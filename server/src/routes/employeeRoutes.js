import express from "express";

import {
    getEmployees,
    getEmployeeById,
    updateEmployee,
    promoteEmployee,
    deactivateEmployee,
} from "../controllers/employeeController.js";

import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

router.use(auth);
router.use(role("Admin"));

router.get("/", getEmployees);

router.get("/:id", getEmployeeById);

router.put("/:id", updateEmployee);

router.put("/promote/:id", promoteEmployee);

router.delete("/:id", deactivateEmployee);

export default router;