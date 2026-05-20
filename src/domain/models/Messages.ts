export interface Message {
  id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderProfilePic?: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  mediaUrl?: string;
  createdAt?: Date;
  seenBy?: string[];
  embedding?: number[];
}
