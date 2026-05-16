import { inject, injectable } from "tsyringe";
import { TOKENS } from "@constants/tokens";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { IUpdateProfileUseCase } from "./IUpdateProfileUseCase";
import { AppError } from "@domain/error/appError";
import { HttpStatus } from "@constants/httpStatus";

@injectable()
export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(
    @inject(TOKENS.IUserRepository)
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string, data: { name?: string; profilePic?: string }): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    await this.userRepository.update(userId, data);
  }
}
