import { AuthResponse } from "types/AuthResponse";

export interface IRefreshAccessTokenUseCase {
  execute(refreshToken: string): string;
}