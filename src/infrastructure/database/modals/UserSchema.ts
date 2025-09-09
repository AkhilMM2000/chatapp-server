
import { Schema, model, Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  profile?: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profile: { type: String, default: "" }, // could be URL for profile image
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Map DB _id to domain id
UserSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export default model<IUserDocument>("User", UserSchema);
