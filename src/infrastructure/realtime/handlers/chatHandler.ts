// src/infrastructure/realtime/chatHandler.ts
import { Server, Socket } from "socket.io";
import { container } from "tsyringe";
import { TOKENS } from "@constants/tokens";
import { IAddParticipantUseCase } from "@application/use_cases/chat/AddParticipantUseCase";
import { ISendMessageUseCase } from "@application/use_cases/chat/ISendMessageUseCase";
import { IRoomRepository } from "@domain/repositories/IRoomRepository";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { IAIService } from "@application/services/IAIService";
import { IRateLimitRepository } from "@domain/repositories/IRateLimitRepository";

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const addParticipantUseCase = container.resolve<IAddParticipantUseCase>(
    TOKENS.AddParticipantUseCase
  );
  const sendMessageUseCase = container.resolve<ISendMessageUseCase>(
    TOKENS.ISendMessageUseCase
  );
   const roomRepository=container.resolve<IRoomRepository>(
    TOKENS.IChatRoomRepository
   );
    const aiService = container.resolve<IAIService>(TOKENS.IAIService);
    const messageRepository = container.resolve<IMessageRepository>(TOKENS.IMessageRepository);
    const rateLimitRepository = container.resolve<IRateLimitRepository>(TOKENS.IRateLimitRepository);

  // 🔹 Join Room
  socket.on("joinRoom", async ({ roomId }) => {
    try {
      const user = socket.data.user;
 const room=await roomRepository.findByRoomId(roomId);
     if(!room){
          return socket.emit("joinRoomError", { message: "This room doesn't exist ❌" });
     }
     const alreadyExist=room.participants.find(p=>p.userId==user.id);
     let updatedRoom ;
    if(!alreadyExist){
 updatedRoom = await addParticipantUseCase.execute({
        roomId,
        userId: user.id,
        name: user.name,
      });
    }
    
      socket.join(roomId);

      
      socket.emit("roomJoined", {
        roomId,
        participants: updatedRoom?.participants,
      });

      socket.to(roomId).emit("participantJoined", {
        userId: user.id,
        name: user.name,
      });
    } catch (error) {
      console.log(error)
      socket.emit("joinRoomError", { message: "Failed to join room" });
    }
  });

  // 🔹 Send Message
  socket.on("sendMessage", async ({ roomId, content }) => {
    try {
      const user = socket.data.user;

      const savedMessage = await sendMessageUseCase.execute({
        roomId,
        senderId: user.id,
        senderName: user.name,
        content,
      });

      // Send message back to sender (ack)
      socket.emit("messageSent", savedMessage);

      // Broadcast to others in room
      socket.to(roomId).emit("newMessage", savedMessage);

      // 🤖 AI Assistant Integration
      if (content.includes("@assistant")) {
        // 🔒 Apply Rate Limiting (5 requests per 1 minute)
        const isAllowed = await rateLimitRepository.isAllowed(`ai:${user.id}`, 5, 60 * 1000);
        
        if (!isAllowed) {
          return socket.emit("sendMessageError", { 
            message: "Assistant is overwhelmed! Please wait a minute before tagging @assistant again. 🤖✋" 
          });
        }

        // Broadcast AI is typing
        io.to(roomId).emit("USER_TYPING", { userId: "system_ai", name: "Assistant", status: "typing" });

        try {
          // Fetch context (last 15 messages)
          const contextMessages = await messageRepository.getMessagesByRoomId(roomId, 15);
          
          // Generate AI response
          const aiReply = await aiService.generateChatResponse(content, contextMessages);
          
          // Stop typing
          io.to(roomId).emit("USER_TYPING", { userId: "system_ai", name: "Assistant", status: "idle" });

          // Save AI message to DB
          const savedAiMessage = await sendMessageUseCase.execute({
            roomId,
            senderId: "system_ai",
            senderName: "Assistant",
            content: aiReply,
          });

          // Broadcast AI message to everyone in the room
          io.to(roomId).emit("newMessage", savedAiMessage);
        } catch (error) {
          console.error("AI Error:", error);
          io.to(roomId).emit("USER_TYPING", { userId: "system_ai", name: "Assistant", status: "idle" });
        }
      }
    } catch (error) {
      socket.emit("sendMessageError", { message: "Failed to send message" });
    }
  });
  
  socket.on("leaveRoom", ({ roomId, userId, name }) => {
    socket.leave(roomId);
    io.to(roomId).emit("userLeft", { userId, name });
  });


};