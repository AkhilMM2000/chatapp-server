

export interface IAIService {
  /**
   * Sends a prompt to the AI model and returns the generated content.
   * @param prompt The final prompt string to send to the model
   * @param systemInstruction The system instructions for the model's behavior
   * @returns The AI's generated response
   */
  generateContent(prompt: string, systemInstruction: string): Promise<string>;
}
