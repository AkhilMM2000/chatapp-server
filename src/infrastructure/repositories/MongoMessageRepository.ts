import { injectable } from "tsyringe";
import MessageSchema from "@infrastructure/database/modals/MessageSchema";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { Message } from "@domain/models/Messages"; 

@injectable()
export class MongoMessageRepository implements IMessageRepository {
  async save(message: Partial<Message>): Promise<Message> {
    const created = await MessageSchema.create(message);
    
    return this.map(created);
  }

  async getMessagesByRoomId(roomId: string, limit: number = 50, cursor?: string): Promise<Message[]> {
    const query: any = { roomId };
    if (cursor) {
      query._id = { $lt: cursor }; 
    }
    
    const messages = await MessageSchema.find(query)
      .sort({ createdAt: -1 }) 
      .limit(limit)
      .lean();

    messages.reverse();

    return messages.map((m) => this.map(m));
  }

  async markAsSeen(messageIds: string[], userId: string): Promise<void> {
    await MessageSchema.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { seenBy: userId } }
    );
  }

  private map(doc: any): Message {
    return {
      id: doc._id.toString(),
      roomId: doc.roomId,
      senderId: doc.senderId,
      senderName: doc.senderName,
      content: doc.content,
      type: doc.type,
      mediaUrl: doc.mediaUrl,
      createdAt: doc.createdAt,
      seenBy: doc.seenBy || [],
    };
  }
}
