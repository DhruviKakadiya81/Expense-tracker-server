import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transactionService";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const result = await TransactionService.getTransactions(
      (req.user._id as any).toString(),
      req.query as any
    );

    res.status(200).json(new ApiResponse(200, "Transactions retrieved successfully", result));
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const transaction = await TransactionService.getTransactionById(
      (req.user._id as any).toString(),
      req.params.id as string
    );

    res.status(200).json(new ApiResponse(200, "Transaction details retrieved", transaction));
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const transaction = await TransactionService.createTransaction(
      (req.user._id as any).toString(),
      req.body,
      files
    );

    res.status(201).json(new ApiResponse(201, "Transaction created successfully", transaction));
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const transaction = await TransactionService.updateTransaction(
      (req.user._id as any).toString(),
      req.params.id as string,
      req.body,
      files
    );

    res.status(200).json(new ApiResponse(200, "Transaction updated successfully", transaction));
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const result = await TransactionService.deleteTransaction(
      (req.user._id as any).toString(),
      req.params.id as string
    );

    res.status(200).json(new ApiResponse(200, "Transaction deleted successfully", result));
  } catch (error) {
    next(error);
  }
};
