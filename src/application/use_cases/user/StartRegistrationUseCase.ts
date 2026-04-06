import { inject, injectable } from "tsyringe";
import { IStartRegistrationUseCase } from "./IStartRegistrationUseCase";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { IOTPRepository } from "@domain/repositories/IOTPRepository";
import { IEmailService } from "@application/services/IEmailService";
import { HashService } from "@application/services/IHashService";
import { TOKENS } from "@constants/tokens";
import { User } from "@domain/models/User";
import { AppError } from "@domain/error/appError";
import { MESSAGES } from "@constants/messages";
import { HttpStatus } from "@constants/httpStatus";

@injectable()
export class StartRegistration implements IStartRegistrationUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.IOTPRepository) private otpRepository: IOTPRepository,
    @inject(TOKENS.IEmailService) private emailService: IEmailService,
    @inject(TOKENS.GetHashToken) private hashService: HashService
  ) {}

  async execute(data: Pick<User, "name" | "email" | "password">): Promise<void> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(MESSAGES.USER_EXIST_ALREADY, HttpStatus.CONFLICT);
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await this.hashService.hash(data.password);

    await this.otpRepository.save({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      otp,
      createdAt: new Date(),
    });

    await this.emailService.sendOTP(data.email, otp);
  }
}
