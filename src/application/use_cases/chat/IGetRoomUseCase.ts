
import { IGetRoomRequestDTO,IGetRoomResponseDTO } from "./dto/IGetRoomDTO";

export interface IGetRoomUseCase {
  execute(data: IGetRoomRequestDTO): Promise<IGetRoomResponseDTO>;
}
