import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AuthService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, "Account created successfully", result));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AuthService.loginUser(req.body);
    res.status(200).json(new ApiResponse(200, "Logged in successfully", result));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const user = await AuthService.getCurrentUser((req.user._id as any).toString());
    res.status(200).json(new ApiResponse(200, "Current user profile retrieved", user));
  } catch (error) {
    next(error);
  }
};
