/**
 * POST /api/analyze
 *
 * Submit a replay for analysis. Accepts either:
 * - { url: "https://game.mahjongsoul.com/?paipu=..." } — Mahjong Soul replay URL
 * - { url: "XXXXXXXX" } — raw paipu ID
 * - { reportUrl: "https://mjai.ekyu.moe/report/..." } — mjai.ekyu.moe report URL
 *
 * Returns { jobId } immediately. Poll GET /api/jobs/:id for status.
 */

import { Router } from "express";
import { jobQueue } from "../services/jobQueue.js";
import { extractPaipuId } from "../services/replayFetcher.js";
import { extractReportId, fetchReport } from "../services/mjaiService.js";
import type { AnalyzeRequest, AnalyzeResponse } from "../types.js";

const router = Router();

router.post("/", (req, res) => {
  const body = req.body as AnalyzeRequest;

  // ── Path 1: mjai.ekyu.moe report URL ──
  if (body.reportUrl) {
    const reportId = extractReportId(body.reportUrl);

    if (!reportId) {
      res.status(400).json({
        error: "Could not parse report ID from the provided URL. " +
          "Expected a URL like https://mjai.ekyu.moe/report/{id}.html",
      });
      return;
    }

    const jobId = jobQueue.create({
      type: "report",
      reportUrl: body.reportUrl,
      player: body.player,
    });

    processReportJob(jobId, reportId, body.player).catch((err) => {
      console.error(`Job ${jobId} failed:`, err);
      jobQueue.fail(jobId, err instanceof Error ? err.message : String(err));
    });

    const response: AnalyzeResponse = { jobId };
    res.status(202).json(response);
    return;
  }

  // ── Path 2: Mahjong Soul replay URL / paipu ID ──
  if (!body.url) {
    res.status(400).json({
      error: "Missing 'url' or 'reportUrl' field. Provide a Mahjong Soul replay URL, paipu ID, or mjai.ekyu.moe report URL.",
    });
    return;
  }

  // Check if the user accidentally put a report URL in the url field
  const reportId = extractReportId(body.url);
  if (reportId) {
    const jobId = jobQueue.create({
      type: "report",
      reportUrl: body.url,
      player: body.player,
    });

    processReportJob(jobId, reportId, body.player).catch((err) => {
      console.error(`Job ${jobId} failed:`, err);
      jobQueue.fail(jobId, err instanceof Error ? err.message : String(err));
    });

    const response: AnalyzeResponse = { jobId };
    res.status(202).json(response);
    return;
  }

  const paipuId = extractPaipuId(body.url);

  if (!paipuId) {
    res.status(400).json({ error: "Could not parse replay ID from the provided URL." });
    return;
  }

  const jobId = jobQueue.create({
    type: "paipu",
    paipuId,
    player: body.player,
  });

  processPaipuJob(jobId, paipuId, body.player).catch((err) => {
    console.error(`Job ${jobId} failed:`, err);
    jobQueue.fail(jobId, err instanceof Error ? err.message : String(err));
  });

  const response: AnalyzeResponse = { jobId };
  res.status(202).json(response);
});

/**
 * Process a report URL job: fetch the report JSON from mjai.ekyu.moe.
 */
async function processReportJob(
  jobId: string,
  reportId: string,
  playerSeat?: number,
): Promise<void> {
  try {
    jobQueue.updateStatus(jobId, "fetching", "Fetching report from mjai.ekyu.moe...");

    const report = await fetchReport(reportId);

    jobQueue.updateStatus(jobId, "transforming", "Processing report data...");

    // The report contains the review data and mjai log.
    // Return both so the frontend can run the pipeline.
    jobQueue.complete(jobId, {
      review: report.review,
      mjaiLog: report.mjaiLog,
      meta: {
        playerSeat: playerSeat ?? report.player,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    jobQueue.fail(jobId, message);
  }
}

/**
 * Process a paipu ID job.
 * Currently not fully automated — directs user to mjai.ekyu.moe.
 */
async function processPaipuJob(
  jobId: string,
  paipuId: string,
  playerSeat?: number,
): Promise<void> {
  try {
    jobQueue.updateStatus(jobId, "fetching", "Fetching replay from Mahjong Soul...");

    jobQueue.fail(
      jobId,
      `Automatic replay fetching is not yet available. ` +
      `To analyze this replay:\n\n` +
      `1. Open mjai.ekyu.moe (link below) — your replay ID is pre-filled\n` +
      `2. Solve the CAPTCHA and click Submit\n` +
      `3. Copy the report page URL and paste it back here\n\n` +
      `Paipu ID: ${paipuId}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    jobQueue.fail(jobId, message);
  }
}

export default router;
