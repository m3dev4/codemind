import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config } from "../config/env/env.Config.ts";
import type { UploadResult } from "../types/project.ts";

class StorageService {
  private s3client: S3Client;
  private bucketName: string;
  private publicurl: string;

  constructor() {
    this.s3client = new S3Client({
      region: "auto",
      endpoint: `http://${config.S3_PRIVATE_KEY}`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_ACCESS_KEY_SECRET,
      },
    });
    this.bucketName = config.R2_BUCKET_NAME;
    this.publicurl = config.R2_PUBLIC_URL;
  }

  /**
   *
   * Upload un fichier vers R2
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string,
  ): Promise<UploadResult> {
    try {
      //Generer une clé unique
      const timestamp = Date.now();
      const storageKey = `users/${userId}/projects/${timestamp}-${fileName}`;

      //Upload vers R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3client.send(command);

      //Construit l'utl pulblique
      const storageUrl = this.publicurl ? `${this.publicurl}/${storageKey}` : storageKey;

      return {
        storageKey,
        storageUrl,
        fileSize: buffer.length,
      };
    } catch (error) {
      console.error("❌ [Storage Service] Erreur upload:", error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
