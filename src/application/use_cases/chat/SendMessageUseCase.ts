import { injectable, inject } from "tsyringe";
import { ISendMessageRequestDTO,ISendMessageResponseDTO } from "./dto/ISendMessageDTO";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { TOKENS } from "@constants/tokens"; 
import { AppError } from "@domain/error/appError";
import { HttpStatus } from "@constants/httpStatus"; 
import { ISendMessageUseCase } from "./ISendMessageUseCase";
import { MESSAGES } from "@constants/messages";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TOKENS.IMessageRepository)
    private messageRepository: IMessageRepository
  ) {}

  async execute(data: ISendMessageRequestDTO): Promise<ISendMessageResponseDTO> {
    console.log(data,'data have')
    const savedMessage = await this.messageRepository.save({
      roomId: data.roomId,
      senderId: data.senderId,
      content: data.content,
      senderName:data.senderName,
      type: data.type || 'text',
      mediaUrl: data.mediaUrl,
      createdAt: new Date(),
    });

  console.log(savedMessage,'reach here')
    if (!savedMessage) {
      throw new AppError(MESSAGES.FAILED_TOSAVE_MESSAGES, HttpStatus.INTERNAL_ERROR);
    }

    return {
      messageId: savedMessage.id!,
      roomId: savedMessage.roomId,
      senderId: savedMessage.senderId,
      content: savedMessage.content,
      senderName:savedMessage.senderName,
      type: savedMessage.type,
      mediaUrl: savedMessage.mediaUrl,
      createdAt: savedMessage.createdAt!,
    };
  }
}
