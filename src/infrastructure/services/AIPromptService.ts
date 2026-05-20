import { injectable } from "tsyringe";
import { IAIPromptService } from "@application/services/IAIPromptService";
import { Message } from "@domain/models/Messages";

@injectable()
export class AIPromptService implements IAIPromptService {
  getSystemInstruction(): string {
    return "You are a highly helpful, intelligent, and concise AI Assistant participating in a group chat. Your tone should be friendly but directly address the user's needs. Use the chat history provided for context, but do not hallucinate.";
  }

  buildChatPrompt(prompt: string, contextMessages: Message[]): string {
    // Format previous messages into a single text block
    const contextString = contextMessages
      .map((msg) => `[${msg.senderName}]: ${msg.content}`)
      .join("\n");

    return `Here is the recent group chat history for context:\n${contextString}\n\nThe newest message from the user asking for your response is:\n"${prompt}"\n\nPlease provide your response based on the group chat context. Keep it concise.`;
  }
}
