/**
 * Simple in-memory job queue for tracking analysis jobs.
 * Jobs are stored in a Map and expire after 1 hour.
 */

import type { Job, JobStatus, AnalyzeInput, PipelineOutput } from "../types.js";

const EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const MAX_JOBS = 100;

class JobQueue {
  private jobs = new Map<string, Job>();

  /** Create a new job and return its ID */
  create(input: AnalyzeInput): string {
    this.cleanup();

    const id = this.generateId();
    const now = Date.now();

    const job: Job = {
      id,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      input,
    };

    this.jobs.set(id, job);
    return id;
  }

  /** Get a job by ID */
  get(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /** Update job status */
  updateStatus(id: string, status: JobStatus, progress?: string): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = status;
    job.updatedAt = Date.now();
    if (progress !== undefined) job.progress = progress;
  }

  /** Mark job as done with results */
  complete(id: string, result: PipelineOutput): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = "done";
    job.result = result;
    job.updatedAt = Date.now();
    job.progress = "Analysis complete";
  }

  /** Mark job as failed */
  fail(id: string, error: string): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = "error";
    job.error = error;
    job.updatedAt = Date.now();
  }

  /** Remove expired jobs */
  private cleanup(): void {
    const now = Date.now();
    for (const [id, job] of this.jobs) {
      if (now - job.createdAt > EXPIRY_MS) {
        this.jobs.delete(id);
      }
    }

    // If still too many, remove oldest
    if (this.jobs.size >= MAX_JOBS) {
      const sorted = [...this.jobs.entries()].sort(
        (a, b) => a[1].createdAt - b[1].createdAt,
      );
      const toRemove = sorted.slice(0, sorted.length - MAX_JOBS + 1);
      for (const [id] of toRemove) {
        this.jobs.delete(id);
      }
    }
  }

  private generateId(): string {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return `${ts}-${rand}`;
  }
}

// Singleton
export const jobQueue = new JobQueue();
