// src/infrastructure/realtime/chatHandler.ts
import { Server, Socket } from "socket.io";
import { container } from "tsyringe";
import { TOKENS } from "@constants/tokens";
import { IAddParticipantUseCase } from "@application/use_cases/chat/AddParticipantUseCase";
import { ISendMessageUseCase } from "@application/use_cases/chat/ISendMessageUseCase";
import { IRoomRepository } from "@domain/repositories/IRoomRepository";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { IGenerateAIResponseUseCase } from "@application/use_cases/chat/IGenerateAIResponseUseCase";
import { IRateLimitRepository } from "@domain/repositories/IRateLimitRepository";
import { IPresenceRepository } from "@domain/repositories/IPresenceRepository";

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
   const generateAIResponseUseCase = container.resolve<IGenerateAIResponseUseCase>(
    TOKENS.IGenerateAIResponseUseCase
   );
    const messageRepository = container.resolve<IMessageRepository>(TOKENS.IMessageRepository);
    const rateLimitRepository = container.resolve<IRateLimitRepository>(TOKENS.IRateLimitRepository);
    const presenceRepository = container.resolve<IPresenceRepository>(TOKENS.IPresenceRepository);

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
        profilePic: user.profilePic,
      });
    }
    
      socket.join(roomId);

      // 🔍 Fetch only users who are actually in this room
      const roomSockets = await io.in(roomId).fetchSockets();
      const roomActiveUserIds = Array.from(new Set(roomSockets.map(s => s.data.user.id)));
      
      console.log(`[Backend Socket] Socket ${socket.id} (User: ${user.name}) joined Room ${roomId}. Total sockets in room: ${roomSockets.length}`);
      
      socket.emit("roomJoined", {
        roomId,
        participants: updatedRoom?.participants || room?.participants,
        onlineUsers: roomActiveUserIds,
      });

      socket.to(roomId).emit("participantJoined", {
        userId: user.id,
        name: user.name,
        profilePic: user.profilePic,
      });
    } catch (error) {
      console.log(error)
      socket.emit("joinRoomError", { message: "Failed to join room" });
    }
  });

  // 🔹 Send Message
  socket.on("sendMessage", async ({ roomId, content, type, mediaUrl }) => {
    try {
      const user = socket.data.user;
      console.log(`[Backend Socket] Received sendMessage from Socket ${socket.id} (User: ${user.name}) in Room ${roomId}`);

      const savedMessage = await sendMessageUseCase.execute({
        roomId,
        senderId: user.id,
        senderName: user.name,
        senderProfilePic: user.profilePic,
        content,
        type,
        mediaUrl,
      });

      // Send message back to sender (ack)
      socket.emit("messageSent", savedMessage);

      // Broadcast to others in room
      socket.to(roomId).emit("newMessage", savedMessage);

      // 🤖 AI Assistant Integration
      console.log(`[Debug] Checking if message includes @assistant. Message content: "${content}"`);
      
      if (content.includes("@assistant")) {
        console.log(`[Debug] Message contains @assistant! Calling rateLimitRepository.isAllowed...`);
        // 🔒 Apply Rate Limiting (1 request per 1 minute)
        const isAllowed = await rateLimitRepository.isAllowed(`ai:${user.id}`, 1, 60 * 1000);
        
        console.log(`[Debug] isAllowed returned: ${isAllowed}`);
        
        if (!isAllowed) {
          console.log(`[Chat] Rate limit HIT for user: ${user.name}! Emitting sendMessageError to client.`);
          return socket.emit("sendMessageError", { 
            message: "Assistant is overwhelmed! Please wait a minute before tagging @assistant again. 🤖✋" 
          });
        }

        // Broadcast AI is typing
        io.to(roomId).emit("USER_TYPING", { userId: "system_ai", name: "Assistant", status: "typing" });

        try {
          // Offload AI orchestration to the new use case
          const aiReply = await generateAIResponseUseCase.execute({
            roomId,
            prompt: content
          });

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

  socket.on("markAsSeen", async ({ roomId, messageIds }) => {
    try {
      const user = socket.data.user;
      if (!roomId || !messageIds || !messageIds.length) return;

      await messageRepository.markAsSeen(messageIds, user.id);

      // Broadcast to EVERYONE in the room that messages were seen by this user
      io.to(roomId).emit("messagesSeen", {
        roomId,
        messageIds,
        userId: user.id
      });
    } catch (error) {
      console.error("Mark as seen error:", error);
    }
  });


};

