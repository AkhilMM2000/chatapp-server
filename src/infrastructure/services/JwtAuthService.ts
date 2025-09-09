import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";
import { IAuthService } from "@application/services/IAuthService"; 
import { TokenPayload } from "types/tokenPayload"; 
import { AppError } from "@domain/error/appError";
import { HttpStatus } from "@constants/httpStatus";
import { MESSAGES } from "@constants/messages";
import { AuthResponse } from "types/AuthResponse";

@injectable()
export class JWTAuthService implements IAuthService {
  private accessSecret = process.env.ACCESS_TOKEN_SECRET!;
  private refreshSecret = process.env.REFRESH_TOKEN_SECRET!;

  generateAccessToken(payload: object):string{
    return  jwt.sign(payload, this.accessSecret, { expiresIn: "1m" }) 
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: "7d" });
  }

 verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessSecret) as TokenPayload;
    } catch (err) {
          if (err instanceof Error) {
      throw new AppError(err.message,HttpStatus.UNAUTHORIZED);
    }
    throw new AppError(MESSAGES.INVALID_TOKEN,HttpStatus.UNAUTHORIZED);
  }
    
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as TokenPayload;
    } catch (err) {
       if (err instanceof Error) {
      throw new AppError(err.message,HttpStatus.UNAUTHORIZED);
    }
    throw new AppError(MESSAGES.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
    }
  }
}
