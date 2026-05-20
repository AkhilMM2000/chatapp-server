import { injectable } from "tsyringe";
import { IAIService } from "@application/services/IAIService";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@utils/logger";
@injectable()
export class GeminiAIService implements IAIService {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is missing.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || "gemini-flash-latest";
  }

  async generateContent(prompt: string, systemInstruction: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemInstruction,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error(error, "Gemini AI processing failed", { prompt });
      return "I'm having a bit of trouble connecting to my brain right now. Can you try again?";
    }
  }
}
