export type ProjectStatus = "PENDING" | "UPLOADING" | "UPLOADED" | "ANALYZING" | "READY" | "FAILED";

export type SourceType = "GITHUB" | "ZIP";

export interface Prject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  sourceType: SourceType;
  githubUrl?: string | null;
  githubBranch?: string | null;
  storageUrl?: string | null;
  storageKey?: string | null;
  fileSize?: string | null;
  status: ProjectStatus;
  manifest?: any;
  globalSummury?: string | null;
  languages?: Record<string, number> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface createProjectFromZipInput {
  name: string;
  description?: string;
  zipFile: File;
}

export interface createProjectFromGithubInput {
  name: string;
  description?: string;
  githubUrl: string | null;
  githubBranch?: string | null;
}
