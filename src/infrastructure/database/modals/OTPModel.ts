import mongoose, { Schema, Document } from "mongoose";

export interface IOTPDocument extends Document {
  email: string;
  otp: string;
  name: string;
  password: string;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 300s (5 mins)
});

export const OTPModel = mongoose.model<IOTPDocument>("OTP", OTPSchema);
