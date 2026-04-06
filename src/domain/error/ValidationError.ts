import { AppError } from "./appError";
import { HttpStatus } from "@constants/httpStatus";

export class ValidationError extends AppError {
  public errors?: any;

  constructor(message: string, errors?: any) {
    super(message, HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}
