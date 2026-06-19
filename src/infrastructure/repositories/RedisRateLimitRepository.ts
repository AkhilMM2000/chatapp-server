import { injectable } from "tsyringe";
import { IRateLimitRepository } from "@domain/repositories/IRateLimitRepository";
import redisClient from "../config/redisClient";

/**
 * Enterprise-grade Redis implementation of the Rate Limit Repository.
 * Highly scalable, thread-safe, and perfect for multi-server deployments.
 */
@injectable()
export class RedisRateLimitRepository implements IRateLimitRepository {
  async isAllowed(key: string, limit: number, windowMs: number): Promise<boolean> {
    const redisKey = `ratelimit:${key}`;

    try {
      // INCR creates the key if it doesn't exist and increments it automatically
      const currentCount = await redisClient.incr(redisKey);

      // If it's the very first request in the window, set the expiration timer
      if (currentCount === 1) {
        await redisClient.pexpire(redisKey, windowMs);
      }

      // Check against the limit
      if (currentCount > limit) {
        return false; // Throttled! ❌
      }

      return true; // Allowed
    } catch (error) {
      // Fail open: if Redis happens to go down, we allow the request 
      // to prevent a full system outage for legitimate users.
      console.error(`Redis Rate Limit Error:`, error);
      return true; 
    }
  }
}
