import { z } from "zod";

export const CreateRoomSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters"),
  description: z.string().optional(),
});

export const AddParticipantSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
});
