import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAuthService } from '@application/services/IAuthService';
import { TokenPayload } from 'types/tokenPayload'; 
import { MESSAGES } from '@constants/messages'; 3
import { AppError } from '@domain/error/appError'; 
import { HttpStatus } from '@constants/httpStatus';
import { TOKENS } from '@constants/tokens';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@injectable()
export class AuthMiddleware {
  constructor(
    @inject(TOKENS.AuthService)
    private authService: IAuthService
  ) {}

  protectRoute = () => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer")) {
         throw new AppError(MESSAGES.NO_TOKEN, HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = this.authService.verifyAccessToken(token);
        req.user = decoded;
        next();
 
      } catch (err) {
         throw new AppError(MESSAGES.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);

      }
    };
  };
}
