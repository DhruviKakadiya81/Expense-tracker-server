import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel";
import { generateToken } from "../utils/jwt";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      avatarUrl: "",
    });

    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
    });

    const sanitizedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    res.status(201).json(
      new ApiResponse(201, "Account created successfully", {
        user: sanitizedUser,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Explicitly include password for verification
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
    });

    const sanitizedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    res.status(200).json(
      new ApiResponse(200, "Logged in successfully", {
        user: sanitizedUser,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const sanitizedUser = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      avatarUrl: req.user.avatarUrl,
      createdAt: req.user.createdAt,
    };

    res.status(200).json(new ApiResponse(200, "Current user profile retrieved", sanitizedUser));
  } catch (error) {
    next(error);
  }
};
