import { Router } from "express";
import { container } from "tsyringe";
import { AuthMiddleware } from "@middleware/authMiddleware";
import { userController } from "@infrastructure/config/ControllerDi";
import { validate } from "@middleware/validationMiddleware";
import { RegisterSchema, LoginSchema, VerifyOTPSchema, ResendOTPSchema } from "../dtos/UserDTO";
import { catchAsync } from "@utils/catchAsync";

const authMiddleware = container.resolve(AuthMiddleware);
const router = Router();

router
  .post("/register", validate(RegisterSchema), catchAsync(userController.register.bind(userController)))
  .post("/verify-otp", validate(VerifyOTPSchema), catchAsync(userController.verifyOtp.bind(userController)))
  .post("/resend-otp", validate(ResendOTPSchema), catchAsync(userController.resendOtp.bind(userController)))
  .post("/login", validate(LoginSchema), catchAsync(userController.login.bind(userController)))
  .post("/google", catchAsync(userController.googleAuth.bind(userController)))
  .post("/refresh-token", catchAsync(userController.refreshToken.bind(userController)))
  .post("/refresh", catchAsync(userController.refreshToken.bind(userController)))
  .post("/logout", authMiddleware.protectRoute(), catchAsync(userController.logout.bind(userController)));
//   .get("/me", authMiddleware.protectRoute(), userController.getMe.bind(userController));
export default router;
