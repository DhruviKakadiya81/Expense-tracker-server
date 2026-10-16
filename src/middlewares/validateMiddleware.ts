import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { ApiError } from "../utils/apiError";

type RequestLocation = "body" | "query" | "params";

export const validate = (schema: ZodTypeAny, location: RequestLocation = "body") => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[location]);
      if (location === "query") {
        // In Express 5, req.query has only a getter on IncomingMessage.
        // Mutate the query object properties instead of reassigning the reference.
        for (const key of Object.keys(req.query)) {
          delete (req.query as any)[key];
        }
        Object.assign(req.query, parsed);
      } else if (location === "params") {
        Object.assign(req.params, parsed);
      } else {
        req.body = parsed;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(new ApiError(400, "Validation Error", errorMessages));
      } else {
        next(error);
      }
    }
  };
};
