import { User } from "@domain/models/User";
import { BaseRepository } from "./IBaseRepository";

export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<Partial<User> | null>;
  // IUserRepository.ts
findByEmailWithPassword(email: string): Promise<User | null>;

}
