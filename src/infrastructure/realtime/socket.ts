import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import { container } from "tsyringe";
import { IAuthService } from "@application/services/IAuthService";
import { TOKENS } from "@constants/tokens";
import { registerChatHandlers } from "./handlers/chatHandler";
import { IPresenceRepository } from "@domain/repositories/IPresenceRepository";
import { registerPresenceHandlers } from "./handlers/presenceHandler"; 

let io: SocketIOServer;

export const initSocket = (httpServer: http.Server) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173", // ✅ frontend origin
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const authService = container.resolve<IAuthService>(TOKENS.AuthService);
  const presenceRepository = container.resolve<IPresenceRepository>(TOKENS.IPresenceRepository);

  io.use((socket: Socket, next) => {
     const token = socket.handshake.auth.token;
 

    if (!token) {
      
      return next(new Error("NO_TOKEN"));
    }

    try {
      const payload = authService.verifyAccessToken(token); // throws if invalid/expired
  
      // Attach user info for later use
      socket.data.user = {
        id: payload.userId,
        name: payload.name,
      };
  
      next();
    } catch (err: any) {
    
      if (err.name === "TokenExpiredError") {
        return next(new Error("TOKEN_EXPIRED"));
      }
      return next(new Error("INVALID_TOKEN"));
    }
  });
  io.on("connection", async (socket: Socket) => {
    const user = socket.data.user;
    console.log(`🔌 Client connected: ${socket.id} (User: ${user.name})`);

    // Add to presence
    await presenceRepository.add(user.id, socket.id);

    // Notify others that user is online
    io.emit("USER_STATUS_CHANGE", {
      userId: user.id,
      status: "online",
      onlineCount: (await presenceRepository.getOnlineUserIds()).length,
    });

    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);

    socket.on("ping", (data) => {
      socket.emit("pong", { msg: "Hello from server 🚀" });
    });

    // 🚪 Handle Room Cleanup on Disconnect
    socket.on("disconnecting", () => {
      const user = socket.data.user;
      // socket.rooms contains the rooms the socket is currently in
      // Room 0 is always the socket.id itself, so we skip it
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          socket.to(roomId).emit("userLeft", { 
            userId: user.id, 
            name: user.name 
          });
        }
      }
    });

    socket.on("disconnect", async () => {
      const offlineUserId = await presenceRepository.remove(socket.id);
      
      if (offlineUserId) {
        // Only broadcast if the user is completely offline (no more tabs)
        io.emit("USER_STATUS_CHANGE", {
          userId: offlineUserId,
          status: "offline",
          onlineCount: (await presenceRepository.getOnlineUserIds()).length,
        });
      }
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
