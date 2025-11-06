import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config } from "../config/env/env.Config.ts";
import type { UploadResult } from "../types/project.ts";

class StorageService {
  private s3client: S3Client;
  private bucketName: string;
  private publicurl: string;

  constructor() {
    this.s3client = new S3Client({
      region: "auto",
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_ACCESS_KEY_SECRET,
      },
    });
    this.bucketName = config.R2_BUCKET_NAME;
    this.publicurl = config.R2_PUBLIC_URL || "";
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

  async deleteFile(storageKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      await this.s3client.send(command);
      console.log(`✅ [Storage Service] Fichier supprimé: ${storageKey}`);
    } catch (error) {
      console.error("❌ [Storage Service] Erreur suppression:", error);
      throw new Error("Erreur lors de la suppression du fichier");
    }
  }

  async getFile(storageKey: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      const response = await this.s3client.send(command);
      const chunks: Uint8Array[] = [];

      if (response.Body) {
        // @ts-ignore - Body est un stream
        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error("❌ [Storage Service] Erreur récupération:", error);
      throw new Error("Erreur lors de la récupération du fichier");
    }
  }

  /**
   * Alias pour getFile (pour plus de clarté)
   */
  async downloadFile(storageKey: string): Promise<Buffer> {
    return this.getFile(storageKey);
  }
}

export const storageService = new StorageService();
