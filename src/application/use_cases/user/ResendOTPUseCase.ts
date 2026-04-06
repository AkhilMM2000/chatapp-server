import { inject, injectable } from "tsyringe";
import { IResendOTPUseCase } from "./IResendOTPUseCase";
import { IOTPRepository } from "@domain/repositories/IOTPRepository";
import { IEmailService } from "@application/services/IEmailService";
import { TOKENS } from "@constants/tokens";
import { AppError } from "@domain/error/appError";
import { HttpStatus } from "@constants/httpStatus";

@injectable()
export class ResendOTP implements IResendOTPUseCase {
  constructor(
    @inject(TOKENS.IOTPRepository) private otpRepository: IOTPRepository,
    @inject(TOKENS.IEmailService) private emailService: IEmailService
  ) {}

  async execute(email: string): Promise<void> {
    const otpData = await this.otpRepository.findByEmail(email);

    if (!otpData) {
      throw new AppError("No registration in progress for this email.", HttpStatus.NOT_FOUND);
    }

    // Generate new 6 digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update with new OTP
    await this.otpRepository.save({
      ...otpData,
      otp: newOtp,
      createdAt: new Date(),
    });

    await this.emailService.sendOTP(email, newOtp);
  }
}
