import { Message } from "@domain/models/Messages"

export interface IMessageRepository {
  save(message: Partial<Message>): Promise<Message>;
  getMessagesByRoomId(roomId: string,limit?:number): Promise<Message[]>;
}
