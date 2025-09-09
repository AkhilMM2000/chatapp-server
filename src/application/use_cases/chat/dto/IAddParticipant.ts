export interface IAddParticipantRequestDTO {
  roomId: string;
  userId: string;
  name: string;
}

export interface IAddParticipantResponseDTO {
  roomId: string;
  participants:{userId: string; name: string }[];
}
