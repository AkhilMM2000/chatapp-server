import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "@domain/error/appError";
import { ValidationError } from "@domain/error/ValidationError";
import { MESSAGES } from "@constants/messages";
import { HttpStatus } from "@constants/httpStatus";
import { logger } from "@utils/logger";

/**
 * Global Error Handling Middleware
 * Catch-all for operational errors and unexpected crashes.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // 1. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // 2. Handle Custom Domain Errors (AppError and subclasses)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    });
  }

  // 3. Handle MongoDB Duplicate Key Error (Unique Constraint)
  if (err.name === "MongoServerError" && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(HttpStatus.CONFLICT).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
  }

  // 4. Unexpected Errors (The "Bugs")
  logger.error(err, "🔥 INTERNAL SERVER ERROR", {
    correlationId: req.headers["x-correlation-id"],
    url: req.originalUrl,
    method: req.method,
  });

  return res.status(HttpStatus.INTERNAL_ERROR).json({
    success: false,
    message: MESSAGES.SERVER_ERROR || "Something went wrong internally",
  });
}
