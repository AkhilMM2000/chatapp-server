import { IAddParticipantRequestDTO, IAddParticipantResponseDTO } from "./dto/IAddParticipant";

export interface IAddParticipantUseCase {
  execute(data: IAddParticipantRequestDTO): Promise<IAddParticipantResponseDTO>;
}