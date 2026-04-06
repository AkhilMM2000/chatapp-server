import { IOTPData, IOTPRepository } from "@domain/repositories/IOTPRepository";
import { OTPModel } from "../database/modals/OTPModel";

export class MongoOTPRepository implements IOTPRepository {
  async save(data: IOTPData): Promise<void> {
    await OTPModel.findOneAndUpdate(
      { email: data.email },
      { ...data, createdAt: new Date() },
      { upsert: true, new: true }
    );
  }

  async findByEmail(email: string): Promise<IOTPData | null> {
    const doc = await OTPModel.findOne({ email });
    if (!doc) return null;
    return {
      email: doc.email,
      otp: doc.otp,
      name: doc.name,
      password: doc.password,
      createdAt: doc.createdAt,
    };
  }

  async deleteByEmail(email: string): Promise<void> {
    await OTPModel.deleteOne({ email });
  }
}
