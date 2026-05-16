export interface ISendMessageRequestDTO {
  roomId: string;
  senderId: string;
  content: string;
  senderName: string;
  senderProfilePic?: string;
  type?: 'text' | 'image' | 'file';
  mediaUrl?: string;
}

export interface ISendMessageResponseDTO {
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderProfilePic?: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  mediaUrl?: string;
  createdAt: Date;
}
