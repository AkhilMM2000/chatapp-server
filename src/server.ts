
import express from "express";
import dotenv from 'dotenv'
import cors from 'cors';
import "./infrastructure/config/Container";
 import { connectDB } from "@infrastructure/database/database";
 import cookieParser from "cookie-parser";
 import { errorHandler } from "@middleware/errorHanlder";
 import userRoutes from './presentation/routes/userRoute'
 import chatRoutes from './presentation/routes/chatRoute'
 import { initSocket } from "@infrastructure/realtime/socket"; 
 import http from "http";
export const startServer = async () => {
  
  dotenv.config()
  await connectDB();
  const app = express();
  const PORT = process.env.PORT || 3000;
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }));
 
 app.use("/api/auth", userRoutes);
 app.use("/api/chat",chatRoutes)
app.use(errorHandler);

   const httpServer = http.createServer(app);

  
   
  // Init Socket.IO
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

