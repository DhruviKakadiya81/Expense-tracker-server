import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import categoryRoutes from "./categoryRoutes";
import transactionRoutes from "./transactionRoutes";
import dashboardRoutes from "./dashboardRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
