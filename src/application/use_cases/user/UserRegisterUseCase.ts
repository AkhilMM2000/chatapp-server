import { inject, injectable } from "tsyringe";
import { IRegisterUserUseCase } from "./IUserRegisterUseCase"; 
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { HashService } from "@application/services/IHashService";
import { TOKENS } from "@constants/tokens";
import { User } from "@domain/models/User";
import { AppError } from "@domain/error/appError";
import { MESSAGES } from "@constants/messages";
import { HttpStatus } from "@constants/httpStatus";

@injectable()
export class RegisterUser implements IRegisterUserUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.GetHashToken) private hashService: HashService
  ) {}

  async execute(data: Pick<User, "name" | "email" | "password">): Promise<Omit<User, "password">> {

    const existing = await this.userRepository.findByEmail(data.email);
   
    if (existing) {
      
      throw new AppError(MESSAGES.USER_EXIST_ALREADY,HttpStatus.CONFLICT)
     
    }

    const hashedPassword = await this.hashService.hash(data.password);

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Return all required fields except password
    const {  id, name, email } = user;
    return { id: id!, name: name!, email: email! };
  }
}
