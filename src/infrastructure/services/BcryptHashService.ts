import { injectable } from "tsyringe";
import bcrypt from "bcrypt";

import { HashService } from "@application/services/IHashService";

@injectable()
export class BcryptHashService implements HashService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(password, hashed);
  }
}
