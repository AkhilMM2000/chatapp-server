import { inject, injectable } from "tsyringe";
import { IAIContextBuilderService } from "@application/services/IAIContextBuilderService";
import { Message } from "@domain/models/Messages";
import { IAIRetrievalService } from "@application/services/IAIRetrievalService";
import { TOKENS } from "@constants/tokens";

@injectable()
export class AIContextBuilderService implements IAIContextBuilderService {
  constructor(
    @inject(TOKENS.IAIRetrievalService)
    private retrievalService: IAIRetrievalService
  ) {}

  async buildContext(roomId: string, prompt: string): Promise<Message[]> {
    // Step 2: MVP context gathering (just recent messages)
    // Step 4 will modify this to merge recent context + semantic RAG context
    
    // Fetch last 15 messages for chronological context
    const recentMessages = await this.retrievalService.getRecentContext(roomId, 15);
    
    return recentMessages;
  }
}
