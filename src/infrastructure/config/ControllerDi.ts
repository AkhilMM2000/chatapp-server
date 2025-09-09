import { container } from 'tsyringe';
import { UserController } from '@presentation/controllers/userController'; 
import { ChatController } from '@presentation/controllers/chatController';
export const userController = container.resolve(UserController);
export const chatController=container.resolve(ChatController)