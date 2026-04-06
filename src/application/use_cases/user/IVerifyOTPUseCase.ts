import { User } from "@domain/models/User";

export interface IVerifyOTPUseCase {
  execute(email: string, otp: string): Promise<Omit<User, "password">>;
}
