import mongoose, { Schema } from "mongoose";

const RoomSchema = new Schema(
  {
    roomId: { type: String, required: true, unique: true },
    participants: [
      {
        userId: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);
