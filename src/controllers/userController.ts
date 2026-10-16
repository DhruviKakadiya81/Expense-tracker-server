import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const user = await UserService.getProfile((req.user._id as any).toString());
    res.status(200).json(new ApiResponse(200, "User profile retrieved successfully", user));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const updatedUser = await UserService.updateProfile(
      (req.user._id as any).toString(),
      req.user.email,
      req.body
    );

    res.status(200).json(new ApiResponse(200, "Profile updated successfully", updatedUser));
  } catch (error) {
    next(error);
  }
};

export const uploadProfileAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    if (!req.file) {
      throw new ApiError(400, "No image file provided for profile photo");
    }

    const result = await UserService.updateAvatar((req.user._id as any).toString(), req.file.filename);

    res.status(200).json(new ApiResponse(200, "Profile photo updated successfully", result));
  } catch (error) {
    next(error);
  }
};
