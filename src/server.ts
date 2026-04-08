
import express from "express";
import dotenv from 'dotenv'
import cors from 'cors';
import "./infrastructure/config/Container";
 import { connectDB } from "@infrastructure/database/database";
 import cookieParser from "cookie-parser";
 import { errorHandler } from "@middleware/errorHandler";
 import userRoutes from './presentation/routes/userRoute';
 import chatRoutes from './presentation/routes/chatRoute';
 import mediaRoutes from './presentation/routes/mediaRoute';
 import { initSocket } from "@infrastructure/realtime/socket"; 
 import http from "http";
  import { pinoHttp } from "pino-http";
  import { logger } from "@utils/logger";
  import { correlationMiddleware } from "@middleware/correlationMiddleware";
  import { globalRateLimiter } from "@middleware/rateLimiter";
export const startServer = async () => {
  
  await connectDB();
  const app = express();
  const PORT = process.env.PORT || 3000;

  // 1. Move CORS to the VERY TOP (so rate-limited responses still have CORS headers)
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }));

   app.use(correlationMiddleware);
   app.use("/api", globalRateLimiter);
   app.use(pinoHttp({ 
     logger,
     genReqId: (req: any) => req.headers["x-correlation-id"] || req.id
   }));
   app.use(express.json());
   app.use(cookieParser());
 
 app.use("/api/auth", userRoutes);
 app.use("/api/chat", chatRoutes);
 app.use("/api/chat/media", mediaRoutes);
app.use(errorHandler);

   const httpServer = http.createServer(app);

  
   
  // Init Socket.IO
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

