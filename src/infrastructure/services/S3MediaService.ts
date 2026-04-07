import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "tsyringe";
import { IMediaService } from "@application/services/IMediaService";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class S3MediaService implements IMediaService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Generates a presigned URL using the AWS S3 SDK v3.
   * The client can PUT to this URL to upload the file directly.
   */
  async getPresignedUrl(fileName: string, fileType: string): Promise<{ uploadUrl: string; key: string }> {
    const key = `uploads/${uuidv4()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    // URL is valid for 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

    return { uploadUrl, key };
  }
}
