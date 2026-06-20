import { injectable, inject } from "tsyringe";
import { ISendMessageRequestDTO,ISendMessageResponseDTO } from "./dto/ISendMessageDTO";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { TOKENS } from "@constants/tokens"; 
import { AppError } from "@domain/error/appError";
import { HttpStatus } from "@constants/httpStatus"; 
import { ISendMessageUseCase } from "./ISendMessageUseCase";
import { MESSAGES } from "@constants/messages";

import { IEmbeddingService } from "@application/services/IEmbeddingService";
import { logger } from "@utils/logger";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TOKENS.IMessageRepository)
    private messageRepository: IMessageRepository,
    @inject(TOKENS.IEmbeddingService)
    private embeddingService: IEmbeddingService
  ) {}

  async execute(data: ISendMessageRequestDTO): Promise<ISendMessageResponseDTO> {
    
    const savedMessage = await this.messageRepository.save({
      roomId: data.roomId,
      senderId: data.senderId,
      content: data.content,
      senderName: data.senderName,
      senderProfilePic: data.senderProfilePic,
      type: data.type || 'text',
      mediaUrl: data.mediaUrl,
      createdAt: new Date(),
    });

    if (!savedMessage) {
      throw new AppError(MESSAGES.FAILED_TOSAVE_MESSAGES, HttpStatus.INTERNAL_ERROR);
    }

    // Fire-and-forget background task for async embedding ingestion (RAG)
    if (data.content && typeof data.content === 'string' && data.content.trim().length > 0) {
      // We don't await this so it doesn't block the socket response
      this.generateAndSaveEmbedding(savedMessage.id!, data.content).catch(err => {
        logger.error(err, "Failed to generate embedding in background", { messageId: savedMessage.id! });
      });
    }

    return {
      id: savedMessage.id!,
      messageId: savedMessage.id!,
      roomId: savedMessage.roomId,
      senderId: savedMessage.senderId,
      content: savedMessage.content,
      senderName: savedMessage.senderName,
      senderProfilePic: savedMessage.senderProfilePic,
      type: savedMessage.type,
      mediaUrl: savedMessage.mediaUrl,
      createdAt: savedMessage.createdAt!,
    };
  }

  private async generateAndSaveEmbedding(messageId: string, content: string): Promise<void> {
    const embedding = await this.embeddingService.generateEmbedding(content);
    await this.messageRepository.updateEmbedding(messageId, embedding);
  }
}
