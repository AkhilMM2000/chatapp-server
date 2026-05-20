import { inject, injectable } from "tsyringe";
import { IGenerateAIResponseUseCase, IGenerateAIResponseRequestDTO } from "./IGenerateAIResponseUseCase";
import { IAIContextBuilderService } from "@application/services/IAIContextBuilderService";
import { IAIPromptService } from "@application/services/IAIPromptService";
import { IAIService } from "@application/services/IAIService";
import { TOKENS } from "@constants/tokens";

@injectable()
export class GenerateAIResponseUseCase implements IGenerateAIResponseUseCase {
  constructor(
    @inject(TOKENS.IAIContextBuilderService)
    private contextBuilder: IAIContextBuilderService,
    @inject(TOKENS.IAIPromptService)
    private promptService: IAIPromptService,
    @inject(TOKENS.IAIService)
    private aiService: IAIService
  ) {}

  async execute(data: IGenerateAIResponseRequestDTO): Promise<string> {
    // 1. Orchestrate context fetching
    const contextMessages = await this.contextBuilder.buildContext(data.roomId, data.prompt);
    
    // 2. Build the exact prompt string
    const systemInstruction = this.promptService.getSystemInstruction();
    const finalPrompt = this.promptService.buildChatPrompt(data.prompt, contextMessages);

    // 3. Request LLM generation
    const responseText = await this.aiService.generateContent(finalPrompt, systemInstruction);

    return responseText;
  }
}
