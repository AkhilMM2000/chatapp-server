export interface ICreateRoomRequestDTO {
  createdBy: {
    userId: string;
    name: string;
  };
}

export interface ICreateRoomResponseDTO {
  roomId: string;
}


