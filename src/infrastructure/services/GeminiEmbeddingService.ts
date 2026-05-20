import { injectable } from "tsyringe";
import { IEmbeddingService } from "@application/services/IEmbeddingService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@utils/logger";

@injectable()
export class GeminiEmbeddingService implements IEmbeddingService {
  private genAI: GoogleGenerativeAI;
  private embeddingModel: string;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is missing.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use Google's available embedding model
    this.embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Clean up text by removing extra whitespaces, newlines, etc to get better quality embeddings
      const cleanText = text.replace(/\n/g, " ").trim();
      
      const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });
      const result = await model.embedContent(cleanText);
      const embedding = result.embedding;
      
      return embedding.values;
    } catch (error) {
      console.error("🔴 FULL GEMINI EMBEDDING ERROR:", error);
      logger.error(error, "Gemini Embedding processing failed", { textSnippet: text.substring(0, 50) });
      throw new Error("Failed to generate embedding");
    }
  }
}


