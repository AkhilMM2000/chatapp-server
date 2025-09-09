import { Router } from "express";
import { container } from "tsyringe";
import { AuthMiddleware } from "@middleware/authMiddleware";
import { chatController } from "@infrastructure/config/ControllerDi";

const authMiddleware = container.resolve(AuthMiddleware);
const router = Router();

router.
post("/room", authMiddleware.protectRoute(), chatController.createRoom.bind(chatController))
.post('/participant',authMiddleware.protectRoute(),chatController.addParticipant.bind(chatController))
.get(  "/room/:roomId/messages",authMiddleware.protectRoute(),chatController.getMessages.bind(chatController))
.get('/room/:roomId',authMiddleware.protectRoute(),chatController.getRoom.bind(chatController))
export default router;
