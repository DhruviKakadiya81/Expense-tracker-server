import { Router } from "express";
import { getProfile, updateProfile, uploadProfileAvatar } from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { uploadAvatar } from "../middlewares/uploadMiddleware";
import { updateProfileSchema } from "../validations/userValidation";

const router = Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.post("/avatar", uploadAvatar, uploadProfileAvatar);

export default router;
