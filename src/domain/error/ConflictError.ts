import { AppError } from "./appError";
import { HttpStatus } from "@constants/httpStatus";

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
