import { inject, injectable } from "tsyringe";
import { IVerifyOTPUseCase } from "./IVerifyOTPUseCase";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { IOTPRepository } from "@domain/repositories/IOTPRepository";
import { TOKENS } from "@constants/tokens";
import { User } from "@domain/models/User";
import { AppError } from "@domain/error/appError";
import { ValidationError } from "@domain/error/ValidationError";
import { MESSAGES } from "@constants/messages";
import { HttpStatus } from "@constants/httpStatus";

@injectable()
export class VerifyOTP implements IVerifyOTPUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.IOTPRepository) private otpRepository: IOTPRepository
  ) {}

  async execute(email: string, otp: string): Promise<Omit<User, "password">> {
    const otpData = await this.otpRepository.findByEmail(email);

    if (!otpData) {
      throw new ValidationError("Verification data expired or not found. Please try again.");
    }

    if (otpData.otp !== otp) {
      throw new ValidationError("Invalid OTP. Please check your email.");
    }

    // Create user in main repository
    const user = await this.userRepository.create({
      name: otpData.name,
      email: otpData.email,
      password: otpData.password,
    });

    // Cleanup OTP record
    await this.otpRepository.deleteByEmail(email);

    return { id: user.id!, name: user.name!, email: user.email! };
  }
}
