import { IPresenceRepository } from "@domain/repositories/IPresenceRepository";
import { injectable } from "tsyringe";
import redisClient from "../config/redisClient";

/**
 * Enterprise-grade Redis implementation of the Presence Repository.
 * Highly scalable, meaning user presence is accurate across multiple servers.
 */
@injectable()
export class RedisPresenceRepository implements IPresenceRepository {
  
  async add(userId: string, socketId: string): Promise<void> {
    const multi = redisClient.multi();
    
    // 1. Map socketId -> userId (expires after 24h as a safety net against zombie sockets)
    multi.set(`socket:${socketId}`, userId, 'EX', 86400); 
    
    // 2. Add socketId to the user's specific set of active sockets
    multi.sadd(`user:${userId}:sockets`, socketId);
    
    // 3. Add user to the global online users set
    multi.sadd('global:online_users', userId); 
    
    await multi.exec();
  }

  async remove(socketId: string): Promise<string | null> {
    // Look up the user by their socket ID
    const userId = await redisClient.get(`socket:${socketId}`);
    if (!userId) return null;

    // Remove the socket from the user's set of active sockets
    await redisClient.srem(`user:${userId}:sockets`, socketId);
    
    // Delete the socket mapping entirely
    await redisClient.del(`socket:${socketId}`);

    // Check how many active sockets the user still has
    const remainingSockets = await redisClient.scard(`user:${userId}:sockets`);
    
    if (remainingSockets === 0) {
      // If no sockets left, remove them from the global online users list
      await redisClient.srem('global:online_users', userId);
      return userId; // Return the userId so the system knows they went completely offline
    }

    return null; // They still have another socket (e.g. they have two browser tabs open)
  }

  async isOnline(userId: string): Promise<boolean> {
    // SISMEMBER returns 1 if they are in the set, 0 if not.
    const isMember = await redisClient.sismember('global:online_users', userId);
    return isMember === 1;
  }

  async getOnlineUserIds(): Promise<string[]> {
    // Returns the entire set of online users
    return await redisClient.smembers('global:online_users');
  }
}
