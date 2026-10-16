import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { createCategorySchema, updateCategorySchema } from "../validations/categoryValidation";

const router = Router();

router.use(authenticate);

router.get("/", getCategories);
router.post("/", validate(createCategorySchema), createCategory);
router.put("/:id", validate(updateCategorySchema), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
