export interface Room {
  id?: string;
  roomId: string;
  participants: { userId: string; name: string }[];
  createdAt?: Date;
}
