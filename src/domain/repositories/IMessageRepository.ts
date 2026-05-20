import { Message } from "@domain/models/Messages"

export interface IMessageRepository {
  save(message: Partial<Message>): Promise<Message>;
  getMessagesByRoomId(roomId: string, limit?: number, cursor?: string): Promise<Message[]>;
  markAsSeen(messageIds: string[], userId: string): Promise<void>;
  updateEmbedding(messageId: string, embedding: number[]): Promise<void>;
  getSemanticContext(roomId: string, queryEmbedding: number[], limit: number): Promise<Message[]>;
}
