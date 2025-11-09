import { Queue } from "bullmq";
import { redisConnection, defaultJobOptions } from "../config/queue/queue.config.ts";
import { JobType } from "../types/jobs.ts";
import type { ProcessZipProjectData, ProcessGithubProjectData } from "../types/jobs.ts";

/**
 * Queue pour le traitement des projets
 */
export class ProjectQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("project-processing", {
      connection: redisConnection,
      defaultJobOptions,
    });

    console.log("📦 [Queue] Project queue initialized");
  }

  /**
   * Ajouter un job de traitement de projet ZIP
   */
  async addZipProcessingJob(data: ProcessZipProjectData) {
    const job = await this.queue.add(JobType.PROCESS_ZIP_PROJECT, data, {
      jobId: `zip-${data.projectId}`, // ID unique pour éviter les doublons
    });

    console.log(`✅ [Queue] Job ${JobType.PROCESS_ZIP_PROJECT} ajouté: ${job.id}`);

    return job;
  }

  /**
   * Ajouter un job de traitement de projet GitHub
   */
  async addGithubProcessingJob(data: ProcessGithubProjectData) {
    const job = await this.queue.add(JobType.PROCESS_GITHUB_PROJECT, data, {
      jobId: `github-${data.projectId}`, // ID unique pour éviter les doublons
    });

    console.log(`✅ [Queue] Job ${JobType.PROCESS_GITHUB_PROJECT} ajouté: ${job.id}`);

    return job;
  }

  /**
   * Ajouter un job de scanning de projet
   */
  async addScanJob(data: import("../types/jobs.ts").ScanProjectData) {
    const job = await this.queue.add(JobType.SCAN_PROJECT, data, {
      jobId: `scan-${data.projectId}`,
    });

    console.log(`✅ [Queue] Job ${JobType.SCAN_PROJECT} ajouté: ${job.id}`);

    return job;
  }

  /**
   * Ajouter un job d'analyse de projet
   */
  async addAnalyzeJob(data: import("../types/jobs.ts").AnalyzeProjectData) {
    const job = await this.queue.add(JobType.ANALYZE_PROJECT, data, {
      jobId: `analyze-${data.projectId}`,
    });

    console.log(`✅ [Queue] Job ${JobType.ANALYZE_PROJECT} ajouté: ${job.id}`);

    return job;
  }

  /**
   * Récupérer le statut d'un job
   */
  async getJobStatus(jobId: string) {
    const job = await this.queue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      progress,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  /**
   * Récupérer la queue
   */
  getQueue() {
    return this.queue;
  }

  /**
   * Fermer la queue
   */
  async close() {
    await this.queue.close();
  }
}

// Export singleton
export const projectQueue = new ProjectQueue();
