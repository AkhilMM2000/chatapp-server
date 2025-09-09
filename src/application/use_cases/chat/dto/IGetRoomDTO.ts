
export interface IGetRoomRequestDTO {
  roomId: string;
}


export interface IGetRoomResponseDTO {
  roomId: string;
  participants: { id: string; name: string }[];
}
