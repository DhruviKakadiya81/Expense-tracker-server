import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User profile not found");
    }

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

    const { name, email, phone } = req.body;

    // If changing email, check for uniqueness
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        throw new ApiError(409, "Email is already taken by another account");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

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

    // Relative web URL for serving uploaded image
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    );

    res.status(200).json(
      new ApiResponse(200, "Profile photo updated successfully", {
        avatarUrl,
        user: updatedUser,
      })
    );
  } catch (error) {
    next(error);
  }
};
