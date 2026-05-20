import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    roomId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderProfilePic: { type: String, default: "" },
    content: { type: String, default: "" },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    mediaUrl: { type: String },
    seenBy: { type: [String], default: [] },
    embedding: { type: [Number], required: false },
  },
  { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

export default mongoose.model("Message", MessageSchema);
