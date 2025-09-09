import { inject, injectable } from "tsyringe";
import { ILoginUserUseCase } from "./IUserLogin"; 
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { HashService } from "@application/services/IHashService";
import { IAuthService } from "@application/services/IAuthService";
import { TOKENS } from "@constants/tokens";
import { User } from "@domain/models/User";
import { AppError } from "@domain/error/appError";
import { MESSAGES } from "@constants/messages";
import { HttpStatus } from "@constants/httpStatus";
import { AuthResponse } from "types/AuthResponse"; 

@injectable()
export class LoginUser implements ILoginUserUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.GetHashToken) private hashService: HashService,
    @inject(TOKENS.AuthService) private authService: IAuthService
  ) {}

  async execute(data: Pick<User, "email" | "password">): Promise<Pick<AuthResponse,'name'|'accessToken'|'refreshToken'>> {
    const user = await this.userRepository.findByEmailWithPassword(data.email);
console.log(user,'reach here data')
    if (!user) {
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const isValidPassword = await this.hashService.compare(
      data.password,
      user.password!
    );

    if (!isValidPassword) {
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const payload = { userId: user.id!, name: user.name! };
    const accessToken = this.authService.generateAccessToken(payload);
    const refreshToken = this.authService.generateRefreshToken(payload);

    return {
    
      name: user.name!,
      accessToken,
      refreshToken,
    };
  }
}
