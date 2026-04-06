import { AppError } from "./appError";
import { HttpStatus } from "@constants/httpStatus";

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}
