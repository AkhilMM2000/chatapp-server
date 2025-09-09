import { inject, injectable } from "tsyringe";

import shortid from "shortid";
import { ICreateRoomUseCase } from "./ICreateRoomUseCase";
import {
  ICreateRoomRequestDTO,
  ICreateRoomResponseDTO,
} from "./dto/ICreateRoomDTO";
import { IRoomRepository } from "@domain/repositories/IRoomRepository";
import { TOKENS } from "@constants/tokens";
import { AppError } from "@domain/error/appError";
import { HttpStatus } from "@constants/httpStatus";
import { MESSAGES } from "@constants/messages";

@injectable()
export class CreateRoom implements ICreateRoomUseCase {
  constructor(
    @inject(TOKENS.IChatRoomRepository)
    private roomRepository: IRoomRepository
  ) {}

  async execute(
    data: ICreateRoomRequestDTO
  ): Promise<ICreateRoomResponseDTO> {
   
   const roomId = `ROOM_${shortid.generate()}`;
   
    const existing = await this.roomRepository.findByRoomId(roomId);
    if (existing) {
      throw new AppError(MESSAGES.ROOM_ID_CONFLICT,HttpStatus.CONFLICT);
    }

    const room = await this.roomRepository.create({
      roomId,
      participants: [data.createdBy],
    });

    return {
      roomId: room.roomId,
    };
  }
}
