import { Router } from "express";
import { container } from "tsyringe";
import { AuthMiddleware } from "@middleware/authMiddleware";
import { chatController } from "@infrastructure/config/ControllerDi";
import { catchAsync } from "@utils/catchAsync";
import { validate } from "@middleware/validationMiddleware";
import { AddParticipantSchema } from "../dtos/RoomDTO";

const authMiddleware = container.resolve(AuthMiddleware);
const router = Router();

router.
 post("/room", authMiddleware.protectRoute(), catchAsync(chatController.createRoom.bind(chatController)))
 .post('/participant', authMiddleware.protectRoute(), validate(AddParticipantSchema), catchAsync(chatController.addParticipant.bind(chatController)))
 .get("/room/:roomId/messages", authMiddleware.protectRoute(), catchAsync(chatController.getMessages.bind(chatController)))
 .get('/room/:roomId', authMiddleware.protectRoute(), catchAsync(chatController.getRoom.bind(chatController)))
export default router;
