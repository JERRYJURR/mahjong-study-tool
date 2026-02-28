/**
 * GET /api/jobs/:id
 *
 * Poll for job status and results.
 */

import { Router } from "express";
import { jobQueue } from "../services/jobQueue.js";
import type { JobStatusResponse } from "../types.js";

const router = Router();

router.get("/:id", (req, res) => {
  const job = jobQueue.get(req.params.id);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const response: JobStatusResponse = {
    id: job.id,
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
  };

  res.json(response);
});

export default router;
