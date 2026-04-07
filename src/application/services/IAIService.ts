import { Message } from "@domain/models/Messages";

export interface IAIService {
  /**
   * Generates a context-aware response based on the chat history.
   * @param prompt The prompt or question asked to the AI
   * @param contextMessages The recent messages in the room to provide context
   * @returns The AI's generated response
   */
  generateChatResponse(prompt: string, contextMessages: Message[]): Promise<string>;
}
