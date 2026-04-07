import { Server as SocketIOServer, Socket } from "socket.io";

/**
 * Handlers for Presence & Live Feedback events (Typing, etc.)
 */
export const registerPresenceHandlers = (io: SocketIOServer, socket: Socket) => {
  const user = socket.data.user;

  // 1. User starts typing in a specific room
  socket.on("TYPING_START", ({ roomId }: { roomId: string }) => {
    // Broadcast to everyone in the room EXCEPT the sender
    socket.to(roomId).emit("USER_TYPING", {
      userId: user.id,
      name: user.name,
      status: "typing",
    });
  });

  // 2. User stops typing or sends message
  socket.on("TYPING_STOP", ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit("USER_TYPING", {
      userId: user.id,
      name: user.name,
      status: "idle",
    });
  });
};
