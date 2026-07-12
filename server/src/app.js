import express from "express";
import cors from "cors";
import morgan from "morgan";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AssetFlow API Running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/employees", employeeRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
