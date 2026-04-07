/**
 * Interface for Media related services (S3 uploads, file processing, etc.)
 */
export interface IMediaService {
  /**
   * Generates a presigned URL for direct file upload to S3.
   * @param fileName Original name of the file
   * @param fileType MIME type of the file (e.g. image/jpeg)
   * @returns Object containing the upload URL and the unique S3 Key
   */
  getPresignedUrl(fileName: string, fileType: string): Promise<{ uploadUrl: string; key: string }>;
}
