import { Message } from "@domain/models/Messages";

export interface IAIContextBuilderService {
  buildContext(roomId: string, prompt: string): Promise<Message[]>;
}
