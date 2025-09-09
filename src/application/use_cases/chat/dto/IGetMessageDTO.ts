export interface IGetMessagesRequestDTO {
  roomId: string;
  limit?: number;
}

export interface IMessageDTO {
  id: string;
  roomId: string;
  senderId: string;
   senderName: string;
  content: string;
  createdAt: Date;
}

export interface IGetMessagesResponseDTO {
  roomId: string;
  messages: IMessageDTO[];
}
