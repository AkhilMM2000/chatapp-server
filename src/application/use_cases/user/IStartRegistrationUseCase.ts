import { User } from "@domain/models/User";

export interface IStartRegistrationUseCase {
  execute(data: Pick<User, "name" | "email" | "password">): Promise<void>;
}
