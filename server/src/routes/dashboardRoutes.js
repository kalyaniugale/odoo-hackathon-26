import express from "express";

import { getDashboard } from "../controllers/dashboardController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getDashboard);

export default router;