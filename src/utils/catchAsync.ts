import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async express handler to automatically catch errors and pass them to next()
 */
export const catchAsync = (fn: any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
