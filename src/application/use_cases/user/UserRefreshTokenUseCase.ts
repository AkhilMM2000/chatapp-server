import { inject, injectable } from "tsyringe";
import { IAuthService } from "@application/services/IAuthService"; 
import { AppError } from "@domain/error/appError"; 
import { AuthResponse } from "types/AuthResponse";
import { HttpStatus } from "@constants/httpStatus";
import { MESSAGES } from "@constants/messages";
import { IRefreshAccessTokenUseCase } from "./IUserRefreshTokenUseCase"; 
import { TOKENS } from "@constants/tokens";
import { TokenPayload } from "types/tokenPayload";

@injectable()
export class RefreshAccessTokenUseCase implements IRefreshAccessTokenUseCase {
  constructor(
    @inject(TOKENS.AuthService) private authService:IAuthService
  ) {}

  execute(refreshToken: string):string{
    if (!refreshToken) {
      throw new AppError(MESSAGES.NO_TOKEN, HttpStatus.FORBIDDEN);
    }

    let payload: TokenPayload;
    try {
      payload = this.authService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(MESSAGES.INVALID_REFRESHTOKEN,HttpStatus.FORBIDDEN );
    }

    return this.authService.generateAccessToken({
      userId: payload.userId,
       name: payload.name,
    });
  }
}
