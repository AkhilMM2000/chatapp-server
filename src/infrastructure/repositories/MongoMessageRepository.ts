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

  async getMessagesByRoomId(roomId: string,limit:number): Promise<Message[]> {
    const messages = await MessageSchema.find({ roomId }).
    sort({ createdAt: 1 })
    .limit(limit)
    .lean();

    return messages.map((m) => this.map(m));
  }

  private map(doc: any): Message {
    return {
      id: doc._id.toString(),
      roomId: doc.roomId,
      senderId: doc.senderId,
      senderName: doc.senderName,
      content: doc.content,
      createdAt: doc.createdAt,
    };
  }
}
