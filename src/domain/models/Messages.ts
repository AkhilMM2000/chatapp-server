export interface Message {
  id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  mediaUrl?: string;
  createdAt?: Date;
  seenBy?: string[];
}
