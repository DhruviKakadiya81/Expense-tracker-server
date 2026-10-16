import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User, IUser } from "../models/userModel";
import { ApiError } from "../utils/apiError";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Authentication token missing");
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "User not found or account no longer exists");
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new ApiError(401, "Token expired or invalid. Please log in again."));
    } else {
      next(error);
    }
  }
};
