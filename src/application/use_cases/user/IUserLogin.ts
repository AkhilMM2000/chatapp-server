import { User } from "@domain/models/User";
import { AuthResponse } from "types/AuthResponse"; 

export interface ILoginUserUseCase {
  execute(data: Pick<User, "email" | "password">): Promise<Pick<AuthResponse,'name'|'accessToken'|'refreshToken'>>;
}
