import { Router } from "express";
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { uploadTransactionMedia } from "../middlewares/uploadMiddleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
} from "../validations/transactionValidation";

const router = Router();

router.use(authenticate);

router.get("/", validate(transactionFilterSchema, "query"), getTransactions);
router.post("/", uploadTransactionMedia, validate(createTransactionSchema), createTransaction);
router.get("/:id", getTransactionById);
router.put("/:id", uploadTransactionMedia, validate(updateTransactionSchema), updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
