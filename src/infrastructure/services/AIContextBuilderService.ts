import { inject, injectable } from "tsyringe";
import { IAIContextBuilderService } from "@application/services/IAIContextBuilderService";
import { Message } from "@domain/models/Messages";
import { IAIRetrievalService } from "@application/services/IAIRetrievalService";
import { IEmbeddingService } from "@application/services/IEmbeddingService";
import { TOKENS } from "@constants/tokens";
import { logger } from "@utils/logger";

@injectable()
export class AIContextBuilderService implements IAIContextBuilderService {
  constructor(
    @inject(TOKENS.IAIRetrievalService)
    private retrievalService: IAIRetrievalService,
    @inject(TOKENS.IEmbeddingService)
    private embeddingService: IEmbeddingService
  ) {}

  async buildContext(roomId: string, prompt: string): Promise<Message[]> {
    try {
      // 1. Fetch Short-Term Memory (Recent Context)
      const recentLimit = 10;
      const recentMessages = await this.retrievalService.getRecentContext(roomId, recentLimit);

      // 2. Fetch Long-Term Memory (Semantic Context)
      const semanticLimit = 10;
      const promptEmbedding = await this.embeddingService.generateEmbedding(prompt);
      const semanticMessages = await this.retrievalService.getSemanticContext(roomId, promptEmbedding, semanticLimit);

      // 3. Merge and Deduplicate
      // Use a Map to ensure unique messages based on their ID
      const messageMap = new Map<string, Message>();
      
      // Add semantic messages first
      semanticMessages.forEach(msg => {
        if (msg.id) messageMap.set(msg.id, msg);
      });
      
      // Add recent messages (overwriting/ignoring duplicates)
      recentMessages.forEach(msg => {
        if (msg.id) messageMap.set(msg.id, msg);
      });

      // 4. Convert back to array and Sort Chronologically
      const mergedContext = Array.from(messageMap.values());
      mergedContext.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

      return mergedContext;
    } catch (error) {
      logger.error(error, "Error building hybrid AI context, falling back to chronological", { roomId });
      // Fallback to purely chronological context if semantic search fails
      return await this.retrievalService.getRecentContext(roomId, 15);
    }
  }
}
