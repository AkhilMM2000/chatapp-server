import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import { container } from "tsyringe";
import { IAuthService } from "@application/services/IAuthService";
import { TOKENS } from "@constants/tokens";
import { registerChatHandlers } from "./handlers/chatHandler";

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
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
   registerChatHandlers(io, socket);
  socket.on("ping", (data) => {
    
    socket.emit("pong", { msg: "Hello from server 🚀" });
  });
    socket.on("disconnect", () => {
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
