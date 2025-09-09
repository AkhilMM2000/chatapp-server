import { IGetMessagesRequestDTO, IGetMessagesResponseDTO } from "./dto/IGetMessageDTO";

export interface IGetMessagesUseCase {
  execute(data: IGetMessagesRequestDTO): Promise<IGetMessagesResponseDTO>;
}
