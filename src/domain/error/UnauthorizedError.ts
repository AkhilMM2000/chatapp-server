import { AppError } from "./appError";
import { HttpStatus } from "@constants/httpStatus";

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
