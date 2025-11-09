import type { NextFunction, Request, Response } from "express";
import {
  createProjectFromGitHubSchema,
  createProjectFromZipSchema,
} from "../validations/project.validation.ts";
import { projectService } from "../services/project.service.ts";
import { projectQueue } from "../queues/project.queue.ts";
import { z } from "zod";
import "../middlewares/authMiddleware.ts"; // Import pour la déclaration globale Express.Request.user
import prisma from "../lib/prisma.ts";

console.log("✅ Project controller loaded successfully");

class ProjectController {
  async createFromZip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          message: "No file uploaded",
          success: false,
        });
        return;
      }

      const validatedData = createProjectFromZipSchema.parse(req.body);

      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Créer le projet en DB avec statut PENDING
      const project = await prisma.project.create({
        data: {
          userId,
          name: validatedData.name,
          description: validatedData.description || null,
          sourceType: "ZIP",
          status: "PENDING",
        },
      });

      // Ajouter le job à la queue
      const job = await projectQueue.addZipProcessingJob({
        projectId: project.id,
        userId,
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        name: validatedData.name,
        description: validatedData.description,
      });

      // Retourner immédiatement avec le statut du job
      res.status(202).json({
        success: true,
        message: "Project upload started. Processing in background.",
        data: {
          projectId: project.id,
          jobId: job.id,
          status: "PENDING",
          message: "Use the job ID to check processing status",
        },
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createFromGithub(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createProjectFromGitHubSchema.parse(req.body);

      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Créer le projet en DB avec statut PENDING
      const project = await prisma.project.create({
        data: {
          userId,
          name: validatedData.name,
          description: validatedData.description || null,
          sourceType: "GITHUB",
          githubUrl: validatedData.githubUrl,
          githubBranch: validatedData.githubBranch || "main",
          status: "PENDING",
        },
      });

      // Ajouter le job à la queue
      const job = await projectQueue.addGithubProcessingJob({
        projectId: project.id,
        userId,
        name: validatedData.name,
        description: validatedData.description,
        githubUrl: validatedData.githubUrl,
        githubBranch: validatedData.githubBranch || "main",
      });

      // Retourner immédiatement avec le statut du job
      res.status(202).json({
        success: true,
        message: "Project import started. Processing in background.",
        data: {
          projectId: project.id,
          jobId: job.id,
          status: "PENDING",
          message: "Use the job ID to check processing status",
        },
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getuserProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const projects = await projectService.getUserProjects(userId);

      res.status(200).json({
        success: true,
        message: "Projects retrieved successfully",
        data: projects,
      });
    } catch (error: any) {
      console.error("Error retrieving projects:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }
      const project = await projectService.getProjectById(id || "");

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Project retrieved successfully",
        data: {
          ...project,
          fileSize: project.fileSize?.toString(),
        },
      });
    } catch (error: any) {
      console.error("Error retrieving project:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      await projectService.deleteProject(id || "");

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Vérifier le statut d'un job
   */
  async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        res.status(400).json({
          success: false,
          message: "Job ID is required",
        });
        return;
      }

      const jobStatus = await projectQueue.getJobStatus(jobId);

      if (!jobStatus) {
        res.status(404).json({
          success: false,
          message: "Job not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: jobStatus,
      });
    } catch (error: any) {
      console.error("Error retrieving job status:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const projectController = new ProjectController();
