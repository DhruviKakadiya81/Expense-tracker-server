import { Request, Response, NextFunction } from "express";
import { Category } from "../models/categoryModel";
import { Transaction } from "../models/transactionModel";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const { type } = req.query;
    const filter: any = { user: req.user._id };
    if (type && (type === "income" || type === "expense")) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json(new ApiResponse(200, "Categories retrieved successfully", categories));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const { name, type, color } = req.body;

    // Check if category name with same type exists for user
    const existing = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      type,
    });

    if (existing) {
      throw new ApiError(409, `Category "${name}" of type "${type}" already exists.`);
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      type,
      color: color || (type === "income" ? "#10b981" : "#ef4444"),
    });

    res.status(201).json(new ApiResponse(201, "Category created successfully", category));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const { id } = req.params;
    const { name, type, color } = req.body;

    const category = await Category.findOne({ _id: id, user: req.user._id });
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (name && name !== category.name) {
      const targetType = type || category.type;
      const duplicate = await Category.findOne({
        user: req.user._id,
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        type: targetType,
      });

      if (duplicate) {
        throw new ApiError(409, `Another category named "${name}" already exists for type "${targetType}".`);
      }
      category.name = name;
    }

    if (type) category.type = type;
    if (color) category.color = color;

    await category.save();

    res.status(200).json(new ApiResponse(200, "Category updated successfully", category));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const { id } = req.params;

    const category = await Category.findOne({ _id: id, user: req.user._id });
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    // Integrity Check: Prevent deletion if category is in use by transactions
    const transactionCount = await Transaction.countDocuments({
      user: req.user._id,
      category: id,
    });

    if (transactionCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete "${category.name}": It is linked to ${transactionCount} existing transaction(s). Please reassign or delete those transactions first.`
      );
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, "Category deleted successfully", { id }));
  } catch (error) {
    next(error);
  }
};
