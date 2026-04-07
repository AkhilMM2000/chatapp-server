export interface IPresenceRepository {
  /**
   * Add a user to the online list.
   * Map structure: userId -> Set<socketId> (Handles multiple tabs)
   */
  add(userId: string, socketId: string): Promise<void>;

  /**
   * Remove a socket session from the user.
   * If no more sockets exist for that user, they are considered offline.
   * Returns the userId if they just went offline.
   */
  remove(socketId: string): Promise<string | null>;

  /**
   * Check if a specific user is currently online.
   */
  isOnline(userId: string): Promise<boolean>;

  /**
   * Returns a list of all currently online user IDs.
   */
  getOnlineUserIds(): Promise<string[]>;
}
