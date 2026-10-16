import fs from "fs";
import path from "path";
import { Transaction } from "../models/transactionModel";
import { Category } from "../models/categoryModel";
import { ApiError } from "../utils/apiError";

// Helper to safely remove uploaded files
export const safeDeleteFile = (fileUrl?: string) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  try {
    const relativePath = fileUrl.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error("Failed to delete local file:", err);
  }
};

export interface TransactionFilterDTO {
  search?: string;
  category?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number | string;
  limit?: number | string;
}

export interface CreateTransactionDTO {
  title: string;
  amount: number | string;
  type: "income" | "expense";
  category: string;
  date?: string | Date;
  description?: string;
  videoUrl?: string;
}

export interface UpdateTransactionDTO {
  title?: string;
  amount?: number | string;
  type?: "income" | "expense";
  category?: string;
  date?: string | Date;
  description?: string;
  videoUrl?: string;
  removeReceipt?: boolean | string;
  removeVideo?: boolean | string;
}

export class TransactionService {
  static async getTransactions(userId: string, filters: TransactionFilterDTO) {
    const { search, category, type, startDate, endDate, page = 1, limit = 10 } = filters;

    const query: any = { user: userId };

    // Search by title (case-insensitive regex)
    if (search && search.trim() !== "") {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    // Filter by Category
    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by Type (income / expense)
    if (type && (type === "income" || type === "expense")) {
      query.type = type;
    }

    // Filter by Date Range
    if (startDate || endDate) {
      query.date = {};
      if (startDate && typeof startDate === "string" && startDate.trim() !== "") {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          query.date.$gte = start;
        }
      }
      if (endDate && typeof endDate === "string" && endDate.trim() !== "") {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }
      if (Object.keys(query.date).length === 0) {
        delete query.date;
      }
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate("category", "name type color")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  static async getTransactionById(userId: string, id: string) {
    const transaction = await Transaction.findOne({ _id: id, user: userId }).populate(
      "category",
      "name type color"
    );

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    return transaction;
  }

  static async createTransaction(
    userId: string,
    data: CreateTransactionDTO,
    files?: { [fieldname: string]: Express.Multer.File[] }
  ) {
    const { title, amount, type, category, date, description, videoUrl } = data;

    // Verify category exists and belongs to user
    const categoryDoc = await Category.findOne({ _id: category, user: userId });
    if (!categoryDoc) {
      throw new ApiError(400, "Selected category is invalid or does not exist");
    }

    let receiptUrl = "";
    let finalVideoUrl = videoUrl || "";

    if (files?.receipt && files.receipt[0]) {
      receiptUrl = `/uploads/receipts/${files.receipt[0].filename}`;
    }

    if (files?.video && files.video[0]) {
      finalVideoUrl = `/uploads/videos/${files.video[0].filename}`;
    }

    const transaction = await Transaction.create({
      user: userId,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      description: description || "",
      receiptUrl,
      videoUrl: finalVideoUrl,
    });

    return await transaction.populate("category", "name type color");
  }

  static async updateTransaction(
    userId: string,
    id: string,
    data: UpdateTransactionDTO,
    files?: { [fieldname: string]: Express.Multer.File[] }
  ) {
    const { title, amount, type, category, date, description, videoUrl, removeReceipt, removeVideo } = data;

    const transaction = await Transaction.findOne({ _id: id, user: userId });
    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    // Verify category if changed
    if (category && category !== transaction.category.toString()) {
      const categoryDoc = await Category.findOne({ _id: category, user: userId });
      if (!categoryDoc) {
        throw new ApiError(400, "Selected category is invalid or does not exist");
      }
      transaction.category = category as any;
    }

    if (title) transaction.title = title;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type) transaction.type = type;
    if (date) transaction.date = new Date(date);
    if (description !== undefined) transaction.description = description;

    // Handle files
    // Receipt replacement or removal
    if (files?.receipt && files.receipt[0]) {
      safeDeleteFile(transaction.receiptUrl);
      transaction.receiptUrl = `/uploads/receipts/${files.receipt[0].filename}`;
    } else if (removeReceipt === true || removeReceipt === "true") {
      safeDeleteFile(transaction.receiptUrl);
      transaction.receiptUrl = "";
    }

    // Video replacement or removal
    if (files?.video && files.video[0]) {
      safeDeleteFile(transaction.videoUrl);
      transaction.videoUrl = `/uploads/videos/${files.video[0].filename}`;
    } else if (removeVideo === true || removeVideo === "true") {
      safeDeleteFile(transaction.videoUrl);
      transaction.videoUrl = "";
    } else if (videoUrl !== undefined) {
      if (videoUrl !== transaction.videoUrl && transaction.videoUrl?.startsWith("/uploads/")) {
        safeDeleteFile(transaction.videoUrl);
      }
      transaction.videoUrl = videoUrl;
    }

    await transaction.save();
    return await transaction.populate("category", "name type color");
  }

  static async deleteTransaction(userId: string, id: string) {
    const transaction = await Transaction.findOne({ _id: id, user: userId });
    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    // Clean up attached local files
    safeDeleteFile(transaction.receiptUrl);
    safeDeleteFile(transaction.videoUrl);

    await Transaction.findByIdAndDelete(id);
    return { id };
  }
}
