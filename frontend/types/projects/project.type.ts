export type ProjectStatus = "PENDING" | "UPLOADING" | "UPLOADED" | "ANALYZING" | "READY" | "FAILED";

export type SourceType = "GITHUB" | "ZIP";

export interface FileAnalysis {
  id: string;
  projectId: string;
  path: string;
  language: string;
  summary?: string | null;
  exports: string[];
  imports: string[];
  functions: any[];
  classes?: string[] | null;
  complexity?: number | null;
  linesOfCode: number;
  createdAt: Date;
}

export interface Project {
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
  globalSummary?: string | null;
  languages?: Record<string, number> | null;
  fileAnalyses?: FileAnalysis[];
  createdAt: Date;
  updatedAt: Date;
}

export interface createProjectFromZipInput {
  name: string;
  description?: string;
}

export interface createProjectFromGithubInput {
  name: string;
  description?: string;
  githubUrl: string | null;
  githubBranch?: string | null;
}

export interface ProjectJobResponse {
  projectId: string;
  jobId: string;
  status: "PENDING";
  message: string;
}

export interface JobStatus {
  id: string;
  state: "waiting" | "active" | "completed" | "failed" | "delayed";
  progress?: number;
  data?: any;
  returnvalue?: any;
  failedReason?: string;
  processedOn?: number;
  finishedOn?: number;
}
