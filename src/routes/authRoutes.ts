import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { registerSchema, loginSchema } from "../validations/authValidation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);

export default router;
