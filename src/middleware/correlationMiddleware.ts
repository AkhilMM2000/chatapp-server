import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware to attach a unique Correlation ID to every request.
 * Useful for tracing logs across multiple services.
 */
export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = req.header("x-correlation-id") || uuidv4();
  
  // Set the correlation ID in the request object for later use
  req.headers["x-correlation-id"] = correlationId;
  
  // Also set it in the response header
  res.setHeader("x-correlation-id", correlationId);
  
  next();
};
