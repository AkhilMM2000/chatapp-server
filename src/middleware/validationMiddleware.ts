import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Higher-order middleware for validating request bodies against a Zod schema.
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
