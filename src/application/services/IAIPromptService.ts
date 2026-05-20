import { Message } from "@domain/models/Messages";

export interface IAIPromptService {
  getSystemInstruction(): string;
  buildChatPrompt(prompt: string, contextMessages: Message[]): string;
}
