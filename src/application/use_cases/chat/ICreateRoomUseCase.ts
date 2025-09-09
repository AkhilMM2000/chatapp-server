import { ICreateRoomRequestDTO, ICreateRoomResponseDTO } from "./dto/ICreateRoomDTO";

export interface ICreateRoomUseCase {
  execute(data: ICreateRoomRequestDTO): Promise<ICreateRoomResponseDTO>;
}
