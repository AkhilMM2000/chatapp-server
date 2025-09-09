import { ISendMessageRequestDTO,ISendMessageResponseDTO } from "./dto/ISendMessageDTO";

export interface ISendMessageUseCase {
  execute(data: ISendMessageRequestDTO): Promise<ISendMessageResponseDTO>;
}
