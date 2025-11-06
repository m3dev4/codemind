/**
 * Types pour l'analyse de projet
 */

/**
 * Type d'un élément dans la structure du projet
 */
export interface FileStructureItem {
  path: string;
  type: "file" | "folder";
  size?: number; // Uniquement pour les fichiers
  extension?: string; // Uniquement pour les fichiers
}

/**
 * Manifest du projet (structure complète)
 */
export interface ProjectManifest {
  projectId: string;
  totalFiles: number;
  totalSize: number;
  structure: FileStructureItem[];
  languages: Record<string, number>; // ex: { "typescript": 15, "javascript": 8 }
  scannedAt: Date;
}

/**
 * Données pour le job de scanning
 */
export interface ScanProjectData {
  projectId: string;
  storageKey: string;
}

/**
 * Résultat du scanning
 */
export interface ScanProjectResult {
  projectId: string;
  manifest: ProjectManifest;
}

/**
 * Informations sur une fonction
 */
export interface FunctionInfo {
  name: string;
  params: string[];
  return: string;
  lineStart: number;
  lineEnd: number;
}

/**
 * Analyse d'un fichier
 */
export interface FileAnalysis {
  path: string;
  language: string;
  summary?: string; // Généré par IA
  exports: string[];
  imports: string[];
  functions: FunctionInfo[];
  classes?: string[];
  complexity?: number; // Complexité cyclomatique
  linesOfCode: number;
}

/**
 * Données pour le job d'analyse
 */
export interface AnalyzeProjectData {
  projectId: string;
  manifest: ProjectManifest;
}

/**
 * Résultat de l'analyse
 */
export interface AnalyzeProjectResult {
  projectId: string;
  totalFilesAnalyzed: number;
  analyses: FileAnalysis[];
  globalSummary?: string; // Résumé global du projet généré par IA
}

/**
 * Configuration des patterns à ignorer
 */
export const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  ".next",
  ".nuxt",
  "dist",
  "build",
  "coverage",
  ".cache",
  "vendor",
  ".venv",
  "__pycache__",
  ".DS_Store",
  "*.log",
  "*.lock",
  "*.min.js",
  "*.min.css",
  "*.map",
  "*.exe",
  "*.dll",
  "*.so",
  "*.dylib",
  "*.jpg",
  "*.jpeg",
  "*.png",
  "*.gif",
  "*.ico",
  "*.pdf",
  "*.zip",
  "*.tar",
  "*.gz",
];

/**
 * Extensions de fichiers par langage
 */
export const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  typescript: [".ts", ".tsx"],
  javascript: [".js", ".jsx", ".mjs", ".cjs"],
  python: [".py"],
  java: [".java"],
  csharp: [".cs"],
  go: [".go"],
  rust: [".rs"],
  php: [".php"],
  ruby: [".rb"],
  swift: [".swift"],
  kotlin: [".kt"],
  dart: [".dart"],
  html: [".html", ".htm"],
  css: [".css", ".scss", ".sass", ".less"],
  json: [".json"],
  yaml: [".yaml", ".yml"],
  markdown: [".md", ".mdx"],
  sql: [".sql"],
  shell: [".sh", ".bash"],
};

/**
 * Détecte le langage d'un fichier par son extension
 */
export function detectLanguage(filePath: string): string | null {
  const ext = filePath.substring(filePath.lastIndexOf("."));
  
  for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return language;
    }
  }
  
  return null;
}
