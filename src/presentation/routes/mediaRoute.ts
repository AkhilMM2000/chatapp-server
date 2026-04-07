import { Router } from "express";
import { container } from "tsyringe";
import { AuthMiddleware } from "@middleware/authMiddleware";
import { MediaController } from "../controllers/mediaController";
import { catchAsync } from "@utils/catchAsync";

const authMiddleware = container.resolve(AuthMiddleware);
const mediaController = container.resolve(MediaController);
const router = Router();

router.post(
  "/upload-url",
  authMiddleware.protectRoute(),
  catchAsync(mediaController.getUploadUrl.bind(mediaController))
);

export default router;
