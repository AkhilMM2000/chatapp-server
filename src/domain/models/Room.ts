export interface Room {
  id?: string;
  roomId: string;
  participants: { userId: string; name: string; profilePic?: string }[];
  createdAt?: Date;
}
