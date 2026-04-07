import { injectable } from "tsyringe";
import { IRateLimitRepository } from "@domain/repositories/IRateLimitRepository";

interface ThrottleData {
  count: number;
  resetAt: number;
}

/**
 * In-Memory (Map) implementation of the Rate Limit Repository.
 * Perfect for development and single-server production.
 * Can be easily swapped for Redis later.
 */
@injectable()
export class InMemoryRateLimitRepository implements IRateLimitRepository {
  // Map<key, { count, resetAt }>
  private limiterMap = new Map<string, ThrottleData>();

  async isAllowed(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const data = this.limiterMap.get(key);

    // If key not found or window expired, initialize / reset
    if (!data || now > data.resetAt) {
      this.limiterMap.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    // Check against the limit
    if (data.count < limit) {
      data.count += 1;
      return true;
    }

    // Otherwise, throttled! ❌
    return false;
  }
}
