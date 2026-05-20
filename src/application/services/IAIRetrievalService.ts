import { Message } from "@domain/models/Messages";

export interface IAIRetrievalService {
  getRecentContext(roomId: string, limit: number): Promise<Message[]>;
  // Future Step 3: getSemanticContext(promptEmbedding: number[], roomId: string): Promise<Message[]>;
}
