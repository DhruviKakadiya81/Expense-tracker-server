import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `A record with this ${field} already exists.` : "Duplicate field value entered.";
  }

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((val: any) => ({
      field: val.path,
      message: val.message,
    }));
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, `Endpoint not found: ${req.method} ${req.originalUrl}`));
};
