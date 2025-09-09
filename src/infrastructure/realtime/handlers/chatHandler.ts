// src/infrastructure/realtime/chatHandler.ts
import { Server, Socket } from "socket.io";
import { container } from "tsyringe";
import { TOKENS } from "@constants/tokens";
import { IAddParticipantUseCase } from "@application/use_cases/chat/AddParticipantUseCase";
import { ISendMessageUseCase } from "@application/use_cases/chat/ISendMessageUseCase";
import { IRoomRepository } from "@domain/repositories/IRoomRepository";

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const addParticipantUseCase = container.resolve<IAddParticipantUseCase>(
    TOKENS.AddParticipantUseCase
  );
  const sendMessageUseCase = container.resolve<ISendMessageUseCase>(
    TOKENS.ISendMessageUseCase
  );
   const roomRepository=container.resolve<IRoomRepository>(
    TOKENS.IChatRoomRepository
   )
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
    } catch (error) {
      socket.emit("sendMessageError", { message: "Failed to send message" });
    }
  });
  
  socket.on("leaveRoom", ({ roomId, userId, name }) => {
    socket.leave(roomId);
    io.to(roomId).emit("userLeft", { userId, name });
  });


};