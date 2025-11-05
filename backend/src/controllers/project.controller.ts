import type { NextFunction, Request, Response } from "express";
import {
  createProjectFromGitHubSchema,
  createProjectFromZipSchema,
} from "../validations/project.validation.ts";
import { projectService } from "../services/project.service.ts";
import "../middlewares/authMiddleware.ts"; // Import pour la déclaration globale Express.Request.user

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

      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const project = await projectService.createProjectFromZip(userId, {
        name: validatedData.name,
        description: validatedData.description || "",
        file: req.file,
      });

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: {
          ...project,
          fileSize: project.fileSize?.toString(),
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
      const project = await projectService.createProjectFromGithub(userId, {
        name: validatedData.name,
        description: validatedData.description || "",
        githubUrl: validatedData.githubUrl,
        githubBranch: validatedData.githubBranch,
      });

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: {
          ...project,
          fileSize: project.fileSize?.toString(),
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
}

export const projectController = new ProjectController();
