import fs from "fs/promises";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import { storageService } from "./storage.service.ts";
import {
  type ProjectManifest,
  type FileStructureItem,
  IGNORE_PATTERNS,
  detectLanguage,
} from "../types/analysis.ts";

/**
 * Service de scanning de projet
 */
class ScannerService {
  /**
   * Télécharge le ZIP depuis R2, l'extrait et génère le manifest
   */
  async scanProject(
    projectId: string,
    storageKey: string
  ): Promise<ProjectManifest> {
    const tempDir = path.join(os.tmpdir(), "codemind-scan", projectId);

    try {
      console.log(`📥 [Scanner] Downloading project ${projectId}...`);

      // Télécharger le fichier depuis R2
      const buffer = await storageService.downloadFile(storageKey);

      console.log(`📦 [Scanner] Extracting project...`);

      // Créer le dossier temporaire
      await fs.mkdir(tempDir, { recursive: true });

      // Extraire le ZIP
      const zip = new AdmZip(buffer);
      zip.extractAllTo(tempDir, true);

      console.log(`🔍 [Scanner] Scanning project structure...`);

      // Scanner la structure
      const structure: FileStructureItem[] = [];
      const languages: Record<string, number> = {};
      let totalSize = 0;

      await this.scanDirectory(tempDir, "", structure, languages);

      // Calculer la taille totale
      for (const item of structure) {
        if (item.type === "file" && item.size) {
          totalSize += item.size;
        }
      }

      const manifest: ProjectManifest = {
        projectId,
        totalFiles: structure.filter((i) => i.type === "file").length,
        totalSize,
        structure,
        languages,
        scannedAt: new Date(),
      };

      console.log(
        `✅ [Scanner] Scan complete: ${manifest.totalFiles} files, ${Object.keys(languages).length} languages`
      );

      return manifest;
    } finally {
      // Nettoyer le dossier temporaire
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.error(`⚠️ [Scanner] Failed to cleanup temp dir:`, error);
      }
    }
  }

  /**
   * Scanne récursivement un répertoire
   */
  private async scanDirectory(
    baseDir: string,
    relativePath: string,
    structure: FileStructureItem[],
    languages: Record<string, number>
  ): Promise<void> {
    const fullPath = path.join(baseDir, relativePath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelativePath = path.join(relativePath, entry.name);

      // Ignorer les patterns définis
      if (this.shouldIgnore(entryRelativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        // Ajouter le dossier à la structure
        structure.push({
          path: entryRelativePath,
          type: "folder",
        });

        // Scanner récursivement
        await this.scanDirectory(
          baseDir,
          entryRelativePath,
          structure,
          languages
        );
      } else if (entry.isFile()) {
        // Récupérer les infos du fichier
        const stats = await fs.stat(path.join(baseDir, entryRelativePath));
        const extension = path.extname(entry.name);

        // Détecter le langage
        const language = detectLanguage(entry.name);
        if (language) {
          languages[language] = (languages[language] || 0) + 1;
        }

        // Ajouter le fichier à la structure
        structure.push({
          path: entryRelativePath,
          type: "file",
          size: stats.size,
          extension,
        });
      }
    }
  }

  /**
   * Vérifie si un chemin doit être ignoré
   */
  private shouldIgnore(relativePath: string): boolean {
    const pathParts = relativePath.split(path.sep);

    for (const pattern of IGNORE_PATTERNS) {
      // Pattern exact (nom de dossier/fichier)
      if (pathParts.some((part) => part === pattern)) {
        return true;
      }

      // Pattern avec wildcard (*.ext)
      if (pattern.includes("*")) {
        const regex = new RegExp(
          "^" + pattern.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$"
        );
        if (regex.test(path.basename(relativePath))) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Lit le contenu d'un fichier depuis le projet extrait
   */
  async readFileFromProject(
    projectId: string,
    storageKey: string,
    filePath: string
  ): Promise<string> {
    const tempDir = path.join(os.tmpdir(), "codemind-analyze", projectId);

    try {
      // Télécharger et extraire si nécessaire
      const extractedDir = await this.ensureExtracted(
        projectId,
        storageKey,
        tempDir
      );

      // Lire le fichier
      const fullPath = path.join(extractedDir, filePath);
      const content = await fs.readFile(fullPath, "utf-8");

      return content;
    } catch (error) {
      console.error(`❌ [Scanner] Failed to read file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * S'assure que le projet est extrait, ou l'extrait si nécessaire
   */
  private async ensureExtracted(
    projectId: string,
    storageKey: string,
    tempDir: string
  ): Promise<string> {
    // Vérifier si déjà extrait
    try {
      await fs.access(tempDir);
      return tempDir;
    } catch {
      // Pas encore extrait, on le fait
      await fs.mkdir(tempDir, { recursive: true });

      const buffer = await storageService.downloadFile(storageKey);
      const zip = new AdmZip(buffer);
      zip.extractAllTo(tempDir, true);

      return tempDir;
    }
  }

  /**
   * Nettoie le dossier temporaire d'un projet
   */
  async cleanupProject(projectId: string): Promise<void> {
    const tempDir = path.join(os.tmpdir(), "codemind-analyze", projectId);

    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`🧹 [Scanner] Cleaned up temp dir for ${projectId}`);
    } catch (error) {
      console.error(`⚠️ [Scanner] Failed to cleanup:`, error);
    }
  }
}

export const scannerService = new ScannerService();
