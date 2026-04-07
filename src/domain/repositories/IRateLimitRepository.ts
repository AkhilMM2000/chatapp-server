/**
 * Generic Rate Limit Repository Interface.
 * Can be implemented using In-Memory Maps, Redis, or other stores.
 */
export interface IRateLimitRepository {
  /**
   * Checks if the request should be allowed based on a sliding window or fixed window.
   * @param key Unique identifier (e.g., 'ai:user_id' or 'login:ip_address')
   * @param limit Max number of requests allowed in the window
   * @param windowMs Time window in milliseconds
   * @returns Promise resolving to boolean (true = allowed, false = throttled)
   */
  isAllowed(key: string, limit: number, windowMs: number): Promise<boolean>;
}
