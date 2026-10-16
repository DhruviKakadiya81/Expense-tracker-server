import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboardController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/summary", getDashboardSummary);

export default router;
