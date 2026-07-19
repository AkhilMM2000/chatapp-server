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

type JoinRoomResponse =
  | {
      ok: true;
      roomId: string;
      participants: unknown[];
      onlineUsers: string[];
    }
  | { ok: false; message: string };

type JoinRoomAck = (response: JoinRoomResponse) => void;

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

  // 🔹 Join Room
  socket.on("joinRoom", async ({ roomId }: { roomId?: string }, acknowledge?: JoinRoomAck) => {
    const reply = (response: JoinRoomResponse) => {
      if (acknowledge) acknowledge(response);
    };

    try {
      const user = socket.data.user;
      if (!roomId || typeof roomId !== "string") {
        return reply({ ok: false, message: "A valid room ID is required" });
      }

      const room=await roomRepository.findByRoomId(roomId);
     if(!room){
          return reply({ ok: false, message: "This room doesn't exist" });
     }
     const alreadyExist = room.participants.find(p => p.userId.toString() === user.id.toString());
     let updatedRoom ;
    if(!alreadyExist){
 updatedRoom = await addParticipantUseCase.execute({
        roomId,
        userId: user.id,
        name: user.name,
        profilePic: user.profilePic,
      });
    }
    
      const wasAlreadyJoined = socket.rooms.has(roomId);
      await socket.join(roomId);

      // 🔍 Fetch only users who are actually in this room
      const roomSockets = await io.in(roomId).fetchSockets();
      const roomActiveUserIds = Array.from(new Set(roomSockets.map(s => s.data.user.id)));
      
      console.log(`[Socket:join] socket=${socket.id} user=${user.id} room=${roomId} roomSockets=${roomSockets.length}`);
      
      reply({
        ok: true,
        roomId,
        participants: updatedRoom?.participants || room?.participants,
        onlineUsers: roomActiveUserIds,
      });

      if (!wasAlreadyJoined) {
        socket.to(roomId).emit("participantJoined", {
          userId: user.id,
          name: user.name,
          profilePic: user.profilePic,
        });
      }
    } catch (error) {
      console.error(`[Socket:join:error] socket=${socket.id}`, error);
      reply({ ok: false, message: "Failed to join room" });
    }
  });

  // 🔹 Send Message
  socket.on("sendMessage", async ({ roomId, content, type, mediaUrl }) => {
    try {
      const user = socket.data.user;
      if (!roomId || !socket.rooms.has(roomId)) {
        return socket.emit("sendMessageError", { message: "Join the room before sending messages" });
      }

      console.log(`[Socket:send] socket=${socket.id} user=${user.id} room=${roomId}`);

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
      const roomSockets = await io.in(roomId).fetchSockets();
      console.log(`[Socket:broadcast] message=${savedMessage.id} room=${roomId} recipients=${Math.max(0, roomSockets.length - 1)}`);

      // 🤖 AI Assistant Integration
      console.log(`[Debug] Checking if message includes @assistant. Message content: "${content}"`);
      
      if (content?.includes("@assistant")) {
        console.log(`[Debug] Message contains @assistant! Calling rateLimitRepository.isAllowed...`);
        // 🔒 Apply Rate Limiting (1 request per 1 minute)
        const isAllowed = await rateLimitRepository.isAllowed(`ai:${user.id}`, 5, 60 * 1000);
        
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
      console.error(`[Socket:send:error] socket=${socket.id} room=${roomId}`, error);
      socket.emit("sendMessageError", { message: "Failed to send message" });
    }
  });
  
  socket.on("leaveRoom", async ({ roomId }: { roomId?: string }) => {
    if (!roomId || !socket.rooms.has(roomId)) return;

    const user = socket.data.user;
    await socket.leave(roomId);
    const remainingSockets = await io.in(roomId).fetchSockets();
    console.log(`[Socket:leave] socket=${socket.id} user=${user.id} room=${roomId} roomSockets=${remainingSockets.length}`);
    io.to(roomId).emit("userLeft", { userId: user.id, name: user.name });
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

