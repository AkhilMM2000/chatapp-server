import { IGoogleAuthRequestDTO,IGoogleAuthResponseDTO } from "./dto/IGoogleAuthDTO";


export interface IGoogleAuthUseCase {
  execute(data: IGoogleAuthRequestDTO): Promise<IGoogleAuthResponseDTO>;
}
