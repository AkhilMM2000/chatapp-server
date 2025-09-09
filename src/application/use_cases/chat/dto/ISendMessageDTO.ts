export interface ISendMessageRequestDTO {
  roomId: string;
  senderId: string;
  content: string;
  senderName: string;
}

export interface ISendMessageResponseDTO {
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}
