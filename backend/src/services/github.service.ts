import path from "path";
import fs from "fs/promises";
import os from "os";
import { simpleGit } from "simple-git";
import { config } from "../config/env/env.Config.ts";
import AdmZip from "adm-zip";

/*
 * Service de gestion des repo Github
 */

class GithubSerice {
  /**
   * Clone de gestion Github et le compresse en zip
   */

  async cloneAndZip(
    githubUrl: string,
    branch: string = "main",
  ): Promise<{ buffer: Buffer; repoName: string }> {
    // Utiliser le dossier temporaire du système au lieu du projet
    const tempDir = path.join(os.tmpdir(), "codemind-repos", `repo-${Date.now()}`);
    try {
      //Creer le dossier temporaire
      await fs.mkdir(tempDir, { recursive: true });

      console.log(`📥 [GitHub Service] Clonage de ${githubUrl}...`);

      const git = simpleGit();

      // Tenter de cloner avec la branche spécifiée
      try {
        await git.clone(githubUrl, tempDir, {
          "--depth": 1,
          "--branch": branch,
          "--single-branch": null,
        });
      } catch (error: any) {
        // Si la branche n'existe pas, essayer avec 'master' ou sans spécifier de branche
        console.log(
          `⚠️ [GitHub Service] Branche '${branch}' introuvable, tentative avec la branche par défaut...`,
        );

        // Nettoyer le dossier si le clone a partiellement échoué
        await fs.rm(tempDir, { recursive: true, force: true });
        await fs.mkdir(tempDir, { recursive: true });

        // Cloner sans spécifier de branche (utilisera la branche par défaut du repo)
        await git.clone(githubUrl, tempDir, {
          "--depth": 1,
        });
      }

      //Extract le nom du repo
      const repoName = githubUrl.split("/").pop()?.replace(".git", "") || "repo";

      //Verfier la taille du repo
      const stats = await this.getDirectorySize(tempDir);
      const sizeMB = stats / (1024 * 1024);

      if (sizeMB > config.MAX_GITHUB_REPO_SIZE_MB) {
        throw new Error(
          `Le repository est trop volumineux (${sizeMB.toFixed(2)}MB). Maximum autorisé: ${config.MAX_GITHUB_REPO_SIZE_MB}MB`,
        );
      }

      console.log(`📦 [GitHub Service] Compression du repository...`);

      // Creer le zip
      const zip = new AdmZip();
      await this.addDirectoryToZip(zip, tempDir, "");

      const buffer = zip.toBuffer();

      console.log(`✅ [GitHub Service] Repository cloné et compressé`);

      return {
        buffer,
        repoName,
      };
    } catch (error) {
      console.error(
        `❌ [GitHub Service] Erreur lors du clonage et compression du repository: ${error}`,
      );
      throw error;
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true });
      } catch (error) {
        console.error(
          `❌ [GitHub Service] Erreur lors de la suppression du dossier temporaire: ${error}`,
        );
      }
    }
  }

  private async addDirectoryToZip(zip: AdmZip, dirPath: string, zipPath: string): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const zipEntryPath = path.join(zipPath, entry.name);

      if (entry.name === ".git") {
        continue;
      }

      if (entry.isDirectory()) {
        await this.addDirectoryToZip(zip, fullPath, zipEntryPath);
      } else {
        const fileData = await fs.readFile(fullPath);
        zip.addFile(zipEntryPath, fileData);
      }
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let size = 0;
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += await this.getDirectorySize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }
    return size;
  }

  validateGithubUrl(url: string): boolean {
    const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+/;
    return githubRegex.test(url);
  }
}

export const githubService = new GithubSerice();
