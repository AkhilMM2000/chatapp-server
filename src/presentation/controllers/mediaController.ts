import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IMediaService } from "@application/services/IMediaService";
import { TOKENS } from "@constants/tokens";

@injectable()
export class MediaController {
  constructor(
    @inject(TOKENS.IMediaService) private mediaService: IMediaService
  ) {}

  async getUploadUrl(req: Request, res: Response) {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: "fileName and fileType are required" });
    }

    const { uploadUrl, key } = await this.mediaService.getPresignedUrl(fileName, fileType);
    
    // The final URL where the image will be publically accessible (if bucket allows)
    // Or just return the key and construct the S3 URL on the frontend
    const mediaUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({ success: true, uploadUrl, key, mediaUrl });
  }
}
