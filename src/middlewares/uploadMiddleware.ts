import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { avatarUpload, transactionUpload } from "../config/multer";
import { ApiError } from "../utils/apiError";

// Middleware for uploading single profile avatar
export const uploadAvatar = (req: Request, res: Response, next: NextFunction) => {
  const upload = avatarUpload.single("avatar");

  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ApiError(400, "Avatar file size must be less than 5MB"));
      }
      return next(new ApiError(400, err.message));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// Middleware for uploading transaction attachments (receipt image and video)
export const uploadTransactionMedia = (req: Request, res: Response, next: NextFunction) => {
  const upload = transactionUpload.fields([
    { name: "receipt", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]);

  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ApiError(400, "Attachment exceeds maximum allowed size (Receipt: 5MB, Video: 50MB)"));
      }
      return next(new ApiError(400, err.message));
    } else if (err) {
      return next(err);
    }
    next();
  });
};
