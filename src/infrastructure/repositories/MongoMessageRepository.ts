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

  async updateEmbedding(messageId: string, embedding: number[]): Promise<void> {
    await MessageSchema.updateOne({ _id: messageId }, { $set: { embedding } });
  }

  async getSemanticContext(roomId: string, queryEmbedding: number[], limit: number): Promise<Message[]> {
    const messages = await MessageSchema.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: limit * 10,
          limit: limit,
          filter: { roomId: roomId }
        }
      }
    ]);

    // Reverse to chronological order (though vector search returns by similarity, chronological might be better for context)
    // Actually, usually RAG context is ordered by relevance, but Gemini might prefer chronological. 
    // We'll leave it as is, or we can sort by createdAt after. Let's sort by createdAt to preserve flow.
    const sortedMessages = messages.sort((a, b) => a.createdAt - b.createdAt);

    return sortedMessages.map((m) => this.map(m));
  }

  private map(doc: any): Message {
    return {
      id: doc._id.toString(),
      roomId: doc.roomId,
      senderId: doc.senderId,
      senderName: doc.senderName,
      senderProfilePic: doc.senderProfilePic,
      content: doc.content,
      type: doc.type,
      mediaUrl: doc.mediaUrl,
      createdAt: doc.createdAt,
      seenBy: doc.seenBy || [],
      embedding: doc.embedding,
    };
  }
}
