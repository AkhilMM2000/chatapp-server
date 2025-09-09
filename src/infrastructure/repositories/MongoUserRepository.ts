import { BaseRepository } from "@domain/repositories/IBaseRepository";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { User } from "@domain/models/User";
import UserSchema from "@infrastructure/database/modals/UserSchema";
import { injectable } from "tsyringe";
import { AppError } from "@domain/error/appError";
import { HttpStatus } from "@constants/httpStatus";
import { MESSAGES } from "@constants/messages";


@injectable()
export class MongoUserRepository 
  extends BaseRepository<User> 
  implements IUserRepository {

  protected map(entity: any): Partial<User> | null {
  if (!entity) return null;
  return {
    id: entity._id.toString(),
    name: entity.name,
    email: entity.email,
    // password excluded
  };
}


  async create(data: Partial<User>): Promise<Partial<User>> {
  const user = await UserSchema.create(data);
  const mapped = this.map(user);
  if (!mapped) throw new AppError(MESSAGES.MAP_ERROR,HttpStatus.INTERNAL_ERROR);
  return mapped;
}


  async findById(id: string): Promise<Partial<User> | null> {
    const user = await UserSchema.findById(id);
    return this.map(user);
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await UserSchema.find();
    return this.mapArray(users);
  }

  async update(id: string, data: Partial<User>): Promise<Partial<User> | null> {
    const user = await UserSchema.findByIdAndUpdate(id, data, { new: true });
    return this.map(user);
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserSchema.findByIdAndDelete(id);
    return !!result;
  }
// MongoUserRepository.ts
async findByEmailWithPassword(email: string): Promise<User | null> {
  const user = await UserSchema.findOne({ email }).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    password: user.password, // 👈 include password only here
  };
}

  // ---- Extra Method from IUserRepository ----
  async findByEmail(email: string): Promise<Partial<User> | null> {
    const user = await UserSchema.findOne({ email });
    return this.map(user);
  }
}
