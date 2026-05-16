export interface IAddParticipantRequestDTO {
  roomId: string;
  userId: string;
  name: string;
  profilePic?: string;
}

export interface IAddParticipantResponseDTO {
  roomId: string;
  participants:{userId: string; name: string; profilePic?: string }[];
}
