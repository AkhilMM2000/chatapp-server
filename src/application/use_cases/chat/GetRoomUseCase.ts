// src/application/use_cases/chat/GetRoomUseCase.ts
import { injectable, inject } from "tsyringe";
import { IGetRoomUseCase } from "./IGetRoomUseCase";
import { IGetRoomRequestDTO,IGetRoomResponseDTO } from "./dto/IGetRoomDTO";
import { IRoomRepository } from "@domain/repositories/IRoomRepository";
import { TOKENS } from "@constants/tokens";
import { AppError } from "@domain/error/appError";
import { MESSAGES } from "@constants/messages";
import { HttpStatus } from "@constants/httpStatus";

@injectable()
export class GetRoomUseCase implements IGetRoomUseCase {
  constructor(
    @inject(TOKENS.IChatRoomRepository) private roomRepository: IRoomRepository
  ) {}

  async execute({ roomId }: IGetRoomRequestDTO): Promise<IGetRoomResponseDTO> {
    const room = await this.roomRepository.findByRoomId(roomId);

    if (!room) {
      throw new AppError(MESSAGES.ROOM_NOT_FOUND,HttpStatus.NOT_FOUND)
    }

    return {
      roomId: room.roomId!,
      participants: room.participants.map((p) => ({
        id: p.userId,
        name: p.name,
      })),
    };
  }
}
