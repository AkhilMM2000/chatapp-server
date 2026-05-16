import { injectable } from "tsyringe";
import RoomSchema from "@infrastructure/database/modals/RoomSchema";
import { IRoomRepository } from "@domain/repositories/IRoomRepository";
import { Room } from "@domain/models/Room";

@injectable()
export class MongoRoomRepository implements IRoomRepository {
  async create(room: Partial<Room>): Promise<Room> {
    const created = await RoomSchema.create(room);
    return this.map(created);
  }

  async findById(id: string): Promise<Room | null> {
    const room = await RoomSchema.findById(id);
    return room ? this.map(room) : null;
  }

  async addParticipant(
    roomId: string,
    participant: { userId: string; name: string; profilePic?: string }
  ): Promise<Room | null> {
    const updated = await RoomSchema.findOneAndUpdate(
      {roomId},
      { $addToSet: { participants: participant } }, // ✅ correct shape
      { new: true }
    );
    return updated ? this.map(updated) : null;
  }

  async findAll(): Promise<Room[]> {
    const rooms = await RoomSchema.find();
    return rooms.map((room) => this.map(room));
  }
  async findByRoomId(roomId: string): Promise<Room | null> {
    const found = await RoomSchema.findOne({ roomId });
    return found ? this.map(found) : null;
  }

  async updateParticipantProfile(userId: string, data: { name?: string; profilePic?: string }): Promise<void> {
    const update: any = {};
    if (data.name) update["participants.$.name"] = data.name;
    if (data.profilePic !== undefined) update["participants.$.profilePic"] = data.profilePic;

    await RoomSchema.updateMany(
      { "participants.userId": userId },
      { $set: update }
    );
  }
  private map(doc: any): Room {
    return {
      id: doc._id.toString(),
      roomId:doc.roomId,
      participants: doc.participants,
      createdAt: doc.createdAt,
    };
  }
}
