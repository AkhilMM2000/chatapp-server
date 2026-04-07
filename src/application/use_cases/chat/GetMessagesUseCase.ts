import { injectable, inject } from "tsyringe";
import { IGetMessagesUseCase } from "./IGetMessageUseCase"; 
import { IGetMessagesRequestDTO,IGetMessagesResponseDTO } from "./dto/IGetMessageDTO";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { TOKENS } from "@constants/tokens"; 
@injectable()
export class GetMessagesUseCase implements IGetMessagesUseCase {
  constructor(
    @inject(TOKENS.IMessageRepository)
    private messageRepository: IMessageRepository
  ) {}

  async execute(data: IGetMessagesRequestDTO): Promise<IGetMessagesResponseDTO> {
    const messages = await this.messageRepository.getMessagesByRoomId(
      data.roomId,
      data.limit ?? 50,
      data.cursor
    );

    return {
      roomId: data.roomId,
      messages: messages.map((m) => ({
        id: m.id!,
        roomId: m.roomId,
        senderId: m.senderId,
        content: m.content,
        senderName:m.senderName,
        createdAt: m.createdAt!,
      })),
    };
  }
}
