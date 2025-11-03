/**
 * Service de gestion des projets
 */

import prisma from "../lib/prisma.ts";
import type {
  CreateProjectFromGuthubDto,
  CreateProjectFromZipDtp,
  ProjectResponse,
} from "../types/project.ts";
import { githubService } from "./github.service.ts";
import { storageService } from "./storage.service.ts";

class ProjectService {
  /**
   * Cree un projet a partir d'un fichier zip
   * @param userId
   * @param data
   * @returns
   */
  async createProjectFromZip(
    userId: string,
    data: CreateProjectFromZipDtp,
  ): Promise<ProjectResponse> {
    try {
      console.log(`📁 [Project Service] Création projet ZIP: ${data.name}`);

      const uploadResult = await storageService.uploadFile(
        data.file.buffer,
        data.file.originalname,
        data.file.mimetype,
        userId,
      );

      const project = await prisma.project.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          sourceType: "ZIP",
          storageUrl: uploadResult.storageUrl,
          storageKey: uploadResult.storageKey,
          fillSize: BigInt(uploadResult.fileSize),
          status: "UPLOADED",
          language: "",
        },
      });

      console.log(`📁 [Project Service] Projet ZIP créé: ${project.id}`);

      return project;
    } catch (error) {
      console.error(`❌ [Project Service] Erreur lors de la creation du projet: ${error}`);
      throw error;
    }
  }

  /**
   * Cree un projet a partir d'un repository github
   * @param userId
   * @param data
   * @returns
   */
  async createProjectFromGithub(
    userId: string,
    data: CreateProjectFromGuthubDto,
  ): Promise<ProjectResponse> {
    try {
      console.log(`🔗 [Project Service] Création projet GitHub: ${data.name}`);

      const tempProject = await prisma.project.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          sourceType: "GITHUB",
          githubUrl: data.githubUrl,
          githubBranch: data.githubBranch,
          status: "PENDING",
          language: "",
        },
      });

      try {
        const { buffer, repoName } = await githubService.cloneAndZip(
          data.githubUrl,
          data.githubBranch,
        );

        const uploadResult = await storageService.uploadFile(
          buffer,
          `${repoName}.zip`,
          "application/zip",
          userId,
        );

        const project = await prisma.project.update({
          where: {
            id: tempProject.id,
          },
          data: {
            storageUrl: uploadResult.storageUrl,
            storageKey: uploadResult.storageKey,
            fillSize: BigInt(uploadResult.fileSize),
            status: "UPLOADED",
          },
        });

        console.log(`🔗 [Project Service] Projet GitHub créé: ${project.id}`);

        return project;
      } catch (error) {
        console.error(`❌ [Project Service] Erreur lors de la creation du projet: ${error}`);
        throw error;
      }
    } catch (error) {
      console.error(`❌ [Project Service] Erreur lors de la creation du projet: ${error}`);
      throw error;
    }
  }

  /**
   * Recupere les projets d'un utilisateur
   * @param userId
   * @returns
   */
  async getUserProjects(userId: string): Promise<ProjectResponse> {
    try {
      const projects = await prisma.project.findMany({
        where: { userId },
        orderBy: { createAt: "desc" },
      });

      if (!projects) {
        throw new Error("Aucun projet trouvé");
      }

      return projects;
    } catch (error) {
      console.error(`❌ [Project Service] Erreur lors de la recuperation des projets: ${error}`);
      throw error;
    }
  }

  /**
   * Recupere un projet par son id
   * @param projectId
   * @returns
   */
  async getProjectById(projectId: string): Promise<ProjectResponse> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error("Projet non trouvé");
      }

      return project;
    } catch (error) {
      console.error(`❌ [Project Service] Erreur lors de la recuperation du projet: ${error}`);
      throw error;
    }
  }

  /**
   * Supprime un projet
   * @param projectId
   * @returns
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);

      if (!project) {
        throw new Error("Projet non trouvé");
      }

      // Supprimer le fichier de R2
      if (project.storageKey) {
        await storageService.deleteFile(project.storageKey);
      }

      // Supprimer l'entrée de la base de données
      await prisma.project.delete({
        where: { id: projectId },
      });

      console.log(`✅ [Project Service] Projet supprimé: ${projectId}`);
    } catch (error: any) {
      console.error("❌ [Project Service] Erreur suppression:", error);
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }
}
