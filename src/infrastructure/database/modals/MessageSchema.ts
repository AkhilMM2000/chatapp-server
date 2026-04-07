import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    roomId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

export default mongoose.model("Message", MessageSchema);
