import { Room } from "@domain/models/Room";

export interface IRoomRepository {
  create(room: Partial<Room>): Promise<Room>;
  findById(id: string): Promise<Room | null>;
  addParticipant(roomId: string, participant: { userId: string; name: string; profilePic?: string }): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  findByRoomId(roomId: string): Promise<Room | null>; 
  updateParticipantProfile(userId: string, data: { name?: string; profilePic?: string }): Promise<void>;
}
