import { User } from "@domain/models/User";
export interface IRegisterUserUseCase {
  execute(data: Pick<User, "name" | "email" | "password">): Promise<Omit<User, "password">>;
}
