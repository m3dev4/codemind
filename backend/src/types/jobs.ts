/**
 * Types de jobs disponibles
 */
export const JobType = {
  PROCESS_ZIP_PROJECT: "process-zip-project",
  PROCESS_GITHUB_PROJECT: "process-github-project",
} as const;

export type JobType = (typeof JobType)[keyof typeof JobType];

/**
 * Données pour le traitement d'un projet ZIP
 */
export interface ProcessZipProjectData {
  projectId: string;
  userId: string;
  buffer: Buffer;
  fileName: string;
  name: string;
  description?: string;
}

/**
 * Données pour le traitement d'un projet GitHub
 */
export interface ProcessGithubProjectData {
  projectId: string;
  userId: string;
  name: string;
  description?: string;
  githubUrl: string;
  githubBranch: string;
}

/**
 * Résultat du traitement d'un projet
 */
export interface ProjectJobResult {
  projectId: string;
  storageUrl: string;
  storageKey: string;
  fileSize: number;
  status: "UPLOADED" | "FAILED";
}
