import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/queue/queue.config.ts";
import {
  JobType,
  type ProcessZipProjectData,
  type ProcessGithubProjectData,
  type ProjectJobResult,
  type ScanProjectData,
} from "../types/jobs.ts";
import { storageService } from "../services/storage.service.ts";
import { githubService } from "../services/github.service.ts";
import { scannerService } from "../services/scanner.service.ts";
import { analyzerService } from "../services/analyzer.service.ts";
import { projectQueue } from "../queues/project.queue.ts";
import prisma from "../lib/prisma.ts";

/**
 * Worker pour traiter les jobs de projets
 */
export class ProjectWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      "project-processing",
      async (job: Job) => {
        console.log(`🔄 [Worker] Processing job ${job.id} (${job.name})`);

        try {
          let result: any;

          switch (job.name) {
            case JobType.PROCESS_ZIP_PROJECT:
              result = await this.processZipProject(job.data as ProcessZipProjectData, job);
              break;

            case JobType.PROCESS_GITHUB_PROJECT:
              result = await this.processGithubProject(job.data as ProcessGithubProjectData, job);
              break;

            case JobType.SCAN_PROJECT:
              result = await this.scanProject(job.data as ScanProjectData, job);
              break;

            case JobType.ANALYZE_PROJECT:
              result = await this.analyzeProject(job.data as import("../types/jobs.ts").AnalyzeProjectData, job);
              break;

            default:
              throw new Error(`Unknown job type: ${job.name}`);
          }

          console.log(`✅ [Worker] Job ${job.id} completed successfully`);
          return result;
        } catch (error: any) {
          console.error(`❌ [Worker] Job ${job.id} failed:`, error.message);
          throw error;
        }
      },
      {
        connection: redisConnection,
        concurrency: 2, // Traiter 2 jobs en parallèle max
      },
    );

    this.setupEventListeners();
    console.log("👷 [Worker] Project worker started");
  }

  /**
   * Traiter un projet ZIP
   */
  private async processZipProject(
    data: ProcessZipProjectData,
    job: Job,
  ): Promise<ProjectJobResult> {
    const { projectId, userId, buffer, fileName } = data;

    try {
      // Mise à jour du statut
      await job.updateProgress(20);
      await this.updateProjectStatus(projectId, "UPLOADING");

      // Upload vers R2
      await job.updateProgress(50);
      const uploadResult = await storageService.uploadFile(
        buffer,
        fileName,
        "application/zip",
        userId,
      );

      // Mise à jour en DB
      await job.updateProgress(80);
      await prisma.project.update({
        where: { id: projectId },
        data: {
          storageUrl: uploadResult.storageUrl,
          storageKey: uploadResult.storageKey,
          fileSize: BigInt(uploadResult.fileSize),
          status: "UPLOADED",
        },
      });

      await job.updateProgress(100);

      // Chaîner automatiquement le job de scanning
      await projectQueue.addScanJob({
        projectId,
        storageKey: uploadResult.storageKey,
      });

      console.log(`🔗 [Worker] Scan job chained for project ${projectId}`);

      return {
        projectId,
        storageUrl: uploadResult.storageUrl,
        storageKey: uploadResult.storageKey,
        fileSize: uploadResult.fileSize,
        status: "UPLOADED",
      };
    } catch (error) {
      await this.updateProjectStatus(projectId, "FAILED");
      throw error;
    }
  }

  /**
   * Traiter un projet GitHub
   */
  private async processGithubProject(
    data: ProcessGithubProjectData,
    job: Job,
  ): Promise<ProjectJobResult> {
    const { projectId, userId, githubUrl, githubBranch } = data;

    try {
      // Clonage et compression
      await job.updateProgress(10);
      await this.updateProjectStatus(projectId, "UPLOADING");

      console.log(`📥 [Worker] Cloning ${githubUrl}...`);
      await job.updateProgress(30);

      const { buffer, repoName } = await githubService.cloneAndZip(githubUrl, githubBranch);

      // Upload vers R2
      await job.updateProgress(60);
      console.log(`☁️ [Worker] Uploading to R2...`);

      const uploadResult = await storageService.uploadFile(
        buffer,
        `${repoName}.zip`,
        "application/zip",
        userId,
      );

      // Mise à jour en DB
      await job.updateProgress(90);
      await prisma.project.update({
        where: { id: projectId },
        data: {
          storageUrl: uploadResult.storageUrl,
          storageKey: uploadResult.storageKey,
          fileSize: BigInt(uploadResult.fileSize),
          status: "UPLOADED",
        },
      });

      await job.updateProgress(100);

      // Chaîner automatiquement le job de scanning
      await projectQueue.addScanJob({
        projectId,
        storageKey: uploadResult.storageKey,
      });

      console.log(`🔗 [Worker] Scan job chained for project ${projectId}`);

      return {
        projectId,
        storageUrl: uploadResult.storageUrl,
        storageKey: uploadResult.storageKey,
        fileSize: uploadResult.fileSize,
        status: "UPLOADED",
      };
    } catch (error) {
      await this.updateProjectStatus(projectId, "FAILED");
      throw error;
    }
  }

  /**
   * Scanner un projet
   */
  private async scanProject(
    data: ScanProjectData,
    job: Job,
  ): Promise<import("../types/jobs.ts").ScanProjectResult> {
    const { projectId, storageKey } = data;

    try {
      console.log(`🔍 [Worker] Scanning project ${projectId}...`);
      await job.updateProgress(10);

      // Scanner le projet
      const manifest = await scannerService.scanProject(projectId, storageKey);

      await job.updateProgress(80);

      // Sauvegarder le manifest en DB
      await prisma.project.update({
        where: { id: projectId },
        data: {
          manifest: manifest as any,
          languages: manifest.languages as any,
        },
      });

      await job.updateProgress(100);

      console.log(`✅ [Worker] Project ${projectId} scanned successfully`);

      // Chaîner automatiquement le job d'analyse
      await projectQueue.addAnalyzeJob({
        projectId,
        manifest,
      });

      console.log(`🔗 [Worker] Analyze job chained for project ${projectId}`);

      return {
        projectId,
        manifest,
      };
    } catch (error) {
      console.error(`❌ [Worker] Failed to scan project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Analyser un projet
   */
  private async analyzeProject(
    data: import("../types/jobs.ts").AnalyzeProjectData,
    job: Job
  ): Promise<import("../types/jobs.ts").AnalyzeProjectResult> {
    const { projectId, manifest } = data;

    try {
      console.log(`🔬 [Worker] Analyzing project ${projectId}...`);
      await job.updateProgress(10);
      await this.updateProjectStatus(projectId, "ANALYZING");

      // Récupérer le projet pour obtenir le storageKey
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project || !project.storageKey) {
        throw new Error("Project or storage key not found");
      }

      // Analyser les fichiers
      await job.updateProgress(30);
      const analyses = await analyzerService.analyzeProject(
        projectId,
        project.storageKey,
        manifest
      );

      await job.updateProgress(70);

      // Sauvegarder les analyses en DB
      for (const analysis of analyses) {
        await prisma.fileAnalysis.create({
          data: {
            projectId,
            path: analysis.path,
            language: analysis.language,
            summary: analysis.summary || null,
            exports: analysis.exports,
            imports: analysis.imports,
            functions: analysis.functions,
            classes: analysis.classes || [],
            complexity: analysis.complexity || null,
            linesOfCode: analysis.linesOfCode,
          },
        });
      }

      await job.updateProgress(90);

      // Mettre à jour le statut du projet
      await this.updateProjectStatus(projectId, "READY");

      await job.updateProgress(100);

      console.log(`✅ [Worker] Project ${projectId} analyzed successfully`);

      // Nettoyer le dossier temporaire
      await scannerService.cleanupProject(projectId);

      return {
        projectId,
        totalFilesAnalyzed: analyses.length,
        analyses,
      };
    } catch (error) {
      await this.updateProjectStatus(projectId, "FAILED");
      console.error(`❌ [Worker] Failed to analyze project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut du projet
   */
  private async updateProjectStatus(
    projectId: string,
    status: "PENDING" | "UPLOADING" | "UPLOADED" | "ANALYZING" | "READY" | "FAILED",
  ) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });
  }

  /**
   * Configurer les event listeners
   */
  private setupEventListeners() {
    this.worker.on("completed", (job) => {
      console.log(`✅ [Worker] Job ${job.id} has been completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`❌ [Worker] Job ${job?.id} has failed with error:`, err.message);
    });

    this.worker.on("error", (err) => {
      console.error("❌ [Worker] Worker error:", err);
    });
  }

  /**
   * Arrêter le worker
   */
  async close() {
    await this.worker.close();
    console.log("👷 [Worker] Project worker stopped");
  }
}

// Export singleton
export const projectWorker = new ProjectWorker();
