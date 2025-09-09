import { injectable, inject } from "tsyringe";
import { IGoogleAuthUseCase } from "./IGoogleAuthUseCase";
import { IGoogleAuthRequestDTO,IGoogleAuthResponseDTO } from "./dto/IGoogleAuthDTO";
import { TOKENS } from "@constants/tokens";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { IAuthService } from "@application/services/IAuthService";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "@domain/error/appError";
import { MESSAGES } from "@constants/messages";
import { HttpStatus } from "@constants/httpStatus";

@injectable()
export class GoogleAuthUseCase implements IGoogleAuthUseCase {
  private client: OAuth2Client;

  constructor(
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.AuthService) private authService: IAuthService
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async execute(data: IGoogleAuthRequestDTO): Promise<IGoogleAuthResponseDTO> {
    // 1. Verify Google token
  
    const ticket = await this.client.verifyIdToken({
      idToken: data.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
   
    const payload = ticket.getPayload();
    if (!payload) throw new AppError(MESSAGES.INVALID_TOKEN,HttpStatus.UNAUTHORIZED)
 console.log(payload)
    const { email, name } = payload;

    if (!email || !name) throw new AppError(MESSAGES.GOOGLE_ERROR,HttpStatus.BAD_REQUEST);

  
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.userRepository.create({
        email,
        name,
        password: "no_passoword", 
     
      });
    }

   const jwtpayload = { userId: user.id!, name: user.name! };
    const accessToken = this.authService.generateAccessToken(jwtpayload);
    const refreshToken = this.authService.generateRefreshToken(jwtpayload);

    return {
      accessToken,
      refreshToken,
      name: user.name!,
     
    };
  }
}
