import { injectable } from "tsyringe";
import { IAIService } from "@application/services/IAIService";
import { Message } from "@domain/models/Messages";
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

  async generateChatResponse(prompt: string, contextMessages: Message[]): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: "You are a highly helpful, intelligent, and concise AI Assistant participating in a group chat. Your tone should be friendly but directly address the user's needs. Use the chat history provided for context, but do not hallucinate.",
      });

      // Format previous messages into a single text block
      const contextString = contextMessages
        .map((msg) => `[${msg.senderName}]: ${msg.content}`)
        .join("\n");

      const fullPrompt = `Here is the recent group chat history for context:\n${contextString}\n\nThe newest message from the user asking for your response is:\n"${prompt}"\n\nPlease provide your response based on the group chat context. Keep it concise.`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      
      logger.error(error, "Gemini AI processing failed", { prompt });
      return "I'm having a bit of trouble connecting to my brain right now. Can you try again?";
    }
  }
}
