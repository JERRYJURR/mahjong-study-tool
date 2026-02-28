/**
 * POST /api/analyze
 *
 * Submit a replay for analysis. Accepts either:
 * - { url: "https://game.mahjongsoul.com/?paipu=..." } — Mahjong Soul replay URL
 * - { url: "XXXXXXXX" } — raw paipu ID
 * - Multipart file upload with mjai log and/or review JSON (future)
 *
 * Returns { jobId } immediately. Poll GET /api/jobs/:id for status.
 */

import { Router } from "express";
import { jobQueue } from "../services/jobQueue.js";
import { extractPaipuId } from "../services/replayFetcher.js";
import type { AnalyzeRequest, AnalyzeResponse } from "../types.js";

const router = Router();

router.post("/", (req, res) => {
  const body = req.body as AnalyzeRequest;

  if (!body.url) {
    res.status(400).json({ error: "Missing 'url' field. Provide a Mahjong Soul replay URL or paipu ID." });
    return;
  }

  // Parse the paipu ID from the URL/input
  const paipuId = extractPaipuId(body.url);

  if (!paipuId) {
    res.status(400).json({ error: "Could not parse replay ID from the provided URL." });
    return;
  }

  // Create a job
  const jobId = jobQueue.create({
    type: "paipu",
    paipuId,
    player: body.player,
  });

  // Start processing in the background
  processJob(jobId, paipuId, body.player).catch((err) => {
    console.error(`Job ${jobId} failed:`, err);
    jobQueue.fail(jobId, err instanceof Error ? err.message : String(err));
  });

  const response: AnalyzeResponse = { jobId };
  res.status(202).json(response);
});

/**
 * Background job processing.
 * This is where the full pipeline runs:
 * 1. Fetch replay log from Mahjong Soul
 * 2. Convert to mjai format
 * 3. Run mjai-reviewer (Mortal/akochan)
 * 4. Return results
 *
 * For now, this is a stub that demonstrates the flow.
 * Actual Mortal analysis requires model weights (not publicly available)
 * or use of the hosted mjai.ekyu.moe service.
 */
async function processJob(
  jobId: string,
  paipuId: string,
  playerSeat?: number,
): Promise<void> {
  try {
    // Step 1: Fetch replay
    jobQueue.updateStatus(jobId, "fetching", "Fetching replay from Mahjong Soul...");

    // TODO: Implement actual replay fetching via mjsoul or tensoul
    // For now, this will fail gracefully with a clear message
    const replayAvailable = false;

    if (!replayAvailable) {
      // Provide helpful instructions
      jobQueue.fail(
        jobId,
        `Automatic replay fetching is not yet configured. ` +
        `In the meantime, you can:\n` +
        `1. Go to https://mjai.ekyu.moe and paste your replay URL there\n` +
        `2. Download the JSON result\n` +
        `3. Upload it using the "Upload Files" tab\n\n` +
        `Paipu ID: ${paipuId}`,
      );
      return;
    }

    // Step 2: Run analysis
    // jobQueue.updateStatus(jobId, "analyzing", "Running Mortal analysis...");
    // const result = await runMjaiReviewer(replayLog, playerSeat ?? 0);

    // Step 3: Return results
    // jobQueue.complete(jobId, result);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    jobQueue.fail(jobId, message);
  }
}

export default router;
