import { AuthResponse } from "types/AuthResponse";
import { TokenPayload } from "types/tokenPayload";
export interface IAuthService {
  generateAccessToken(payload: object):string;
  generateRefreshToken(payload: object): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
