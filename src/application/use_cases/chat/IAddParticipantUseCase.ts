import { inject, injectable } from "tsyringe";
import { IRoomRepository } from "@domain/repositories/IRoomRepository"; 
import { IAddParticipantRequestDTO,IAddParticipantResponseDTO } from "./dto/IAddParticipant";
import { TOKENS } from "@constants/tokens";
import { AppError } from "@domain/error/appError"; 
import { MESSAGES } from "@constants/messages";
import { HttpStatus } from "@constants/httpStatus";
import { IAddParticipantUseCase } from "./AddParticipantUseCase";

@injectable()
export class AddParticipant implements IAddParticipantUseCase {
  constructor(
    @inject(TOKENS.IChatRoomRepository)
    private roomRepository: IRoomRepository
  ) {}

  async execute(data: IAddParticipantRequestDTO): Promise<IAddParticipantResponseDTO> {
    
    const updatedRoom = await this.roomRepository.addParticipant(
      data.roomId,
      { userId: data.userId, name: data.name } 
    );

    if (!updatedRoom) {
      throw new AppError(MESSAGES.ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    

    return {
      roomId: updatedRoom.roomId,
      participants: updatedRoom.participants,
    };
  }
}
