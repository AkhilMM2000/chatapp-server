export interface IGenerateAIResponseRequestDTO {
  roomId: string;
  prompt: string;
}

export interface IGenerateAIResponseUseCase {
  execute(data: IGenerateAIResponseRequestDTO): Promise<string>;
}
