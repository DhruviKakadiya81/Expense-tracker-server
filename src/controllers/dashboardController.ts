import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboardService";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const data = await DashboardService.getDashboardSummary((req.user._id as any).toString());

    res.status(200).json(new ApiResponse(200, "Dashboard analytics retrieved successfully", data));
  } catch (error) {
    next(error);
  }
};
