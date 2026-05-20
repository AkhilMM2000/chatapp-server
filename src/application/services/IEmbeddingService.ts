export interface IEmbeddingService {
  /**
   * Generates a mathematical vector embedding for the given text.
   * @param text The text to encode
   * @returns An array of numbers representing the semantic meaning of the text
   */
  generateEmbedding(text: string): Promise<number[]>;
}
