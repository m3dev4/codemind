import type { Prisma, ProjectStatus, SourceType } from "../lib/generated/prisma/index.js";

export interface CreateProjectFromZipDtp {
  name: string;
  description?: string;
  file: Express.Multer.File;
}

export interface CreateProjectFromGuthubDto {
  name: string;
  description?: string;
  githubUrl: string;
  githubBranch?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string | null;
  sourceType: SourceType;
  githubUrl?: string | null;
  githubBranch?: string | null;
  fileSize: bigint | null;
  status: ProjectStatus;
  storageKey?: string | null;
  storageUrl?: string | null;
  languages: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadResult {
  storageKey: string;
  storageUrl: string;
  fileSize: number;
}
