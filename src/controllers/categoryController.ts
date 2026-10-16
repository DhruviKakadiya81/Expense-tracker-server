import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/categoryService";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const categories = await CategoryService.getCategories(
      (req.user._id as any).toString(),
      req.query.type as string | undefined
    );

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

    const category = await CategoryService.createCategory((req.user._id as any).toString(), req.body);
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

    const category = await CategoryService.updateCategory(
      (req.user._id as any).toString(),
      req.params.id as string,
      req.body
    );

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

    const result = await CategoryService.deleteCategory((req.user._id as any).toString(), req.params.id as string);
    res.status(200).json(new ApiResponse(200, "Category deleted successfully", result));
  } catch (error) {
    next(error);
  }
};
