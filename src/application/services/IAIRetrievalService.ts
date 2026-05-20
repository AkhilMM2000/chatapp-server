import { Message } from "@domain/models/Messages";

export interface IAIRetrievalService {
  getRecentContext(roomId: string, limit: number): Promise<Message[]>;
  getSemanticContext(roomId: string, queryEmbedding: number[], limit: number): Promise<Message[]>;
}
