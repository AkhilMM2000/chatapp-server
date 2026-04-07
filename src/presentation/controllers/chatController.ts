import {Response, NextFunction } from "express";
import { inject, singleton } from "tsyringe";
import { HttpStatus } from "@constants/httpStatus";
import { TOKENS } from "@constants/tokens";
import { AuthenticatedRequest } from "@middleware/authMiddleware";
import { ICreateRoomUseCase } from "@application/use_cases/chat/ICreateRoomUseCase";
import { IAddParticipantUseCase } from "@application/use_cases/chat/AddParticipantUseCase";
import { IGetMessagesUseCase } from "@application/use_cases/chat/IGetMessageUseCase";
import { IGetRoomUseCase } from "@application/use_cases/chat/IGetRoomUseCase";

@singleton()
export class ChatController {
  constructor(
    @inject(TOKENS.CreateRoomUseCase)
    private chatRoomUseCase: ICreateRoomUseCase,
    @inject(TOKENS.AddParticipantUseCase)
    private addParticpantUseCase: IAddParticipantUseCase,
    @inject(TOKENS.IGetMessageUseCase)
    private getMessagesUseCase:IGetMessagesUseCase,
    @inject(TOKENS.GetRoomUseCase)
    private getRoomUseCase: IGetRoomUseCase
  
  ) {}
  async createRoom(req: AuthenticatedRequest, res: Response) {
    const { roomId } = await this.chatRoomUseCase.execute({
      createdBy: {
        userId: req.user?.userId!,
        name: req.user?.name!,
      },
    });

    return res.status(HttpStatus.CREATED).json({ roomId });
  }

  async addParticipant(req: AuthenticatedRequest, res: Response) {
    const { roomId } = req.body;
    const userId = req.user?.userId!;
    const name = req.user?.name!;

    const result = await this.addParticpantUseCase.execute({
      roomId,
      userId,
      name,
    });

    res.status(HttpStatus.CREATED).json(result);
  }
  async getMessages(req: AuthenticatedRequest, res: Response) {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const cursor = req.query.beforeId as string | undefined;

    const result = await this.getMessagesUseCase.execute({ roomId, limit, cursor });

    res.status(HttpStatus.OK).json(result);
  }

  async getRoom(req: AuthenticatedRequest, res: Response) {
    const { roomId } = req.params;
    const response = await this.getRoomUseCase.execute({ roomId });
    res.status(HttpStatus.OK).json(response);
  }


}
