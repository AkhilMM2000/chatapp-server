import { IPresenceRepository } from "@domain/repositories/IPresenceRepository";
import { injectable } from "tsyringe";

/**
 * In-Memory (Map) implementation of the Presence Repository.
 * Perfect for development and single-server production.
 */
@injectable()
export class InMemoryPresenceRepository implements IPresenceRepository {
  // Map<userId, Set<socketId>>
  private onlineUsers = new Map<string, Set<string>>();
  
  // Inverse Map for fast lookup by socketId: Map<socketId, userId>
  private socketToUserId = new Map<string, string>();

  async add(userId: string, socketId: string): Promise<void> {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(socketId);
    this.socketToUserId.set(socketId, userId);
  }

  async remove(socketId: string): Promise<string | null> {
    const userId = this.socketToUserId.get(socketId);
    if (!userId) return null;

    this.socketToUserId.delete(socketId);
    const sockets = this.onlineUsers.get(userId);
    
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.onlineUsers.delete(userId);
        return userId; // User is now fully offline
      }
    }
    
    return null; // User still has other active sockets
  }

  async isOnline(userId: string): Promise<boolean> {
    return this.onlineUsers.has(userId);
  }

  async getOnlineUserIds(): Promise<string[]> {
    return Array.from(this.onlineUsers.keys());
  }
}
