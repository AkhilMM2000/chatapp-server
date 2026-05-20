import { inject, injectable } from "tsyringe";
import { IAIRetrievalService } from "@application/services/IAIRetrievalService";
import { Message } from "@domain/models/Messages";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { TOKENS } from "@constants/tokens";

@injectable()
export class AIRetrievalService implements IAIRetrievalService {
  constructor(
    @inject(TOKENS.IMessageRepository)
    private messageRepository: IMessageRepository
  ) {}

  async getRecentContext(roomId: string, limit: number): Promise<Message[]> {
    return await this.messageRepository.getMessagesByRoomId(roomId, limit);
  }

  async getSemanticContext(roomId: string, queryEmbedding: number[], limit: number): Promise<Message[]> {
    return await this.messageRepository.getSemanticContext(roomId, queryEmbedding, limit);
  }
}
