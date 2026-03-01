/**
 * POST /api/explain
 *
 * Generate Claude AI explanations for mistakes.
 * The API key can come from:
 * 1. Server-side ANTHROPIC_API_KEY env var (preferred for deployed server)
 * 2. Client-provided key in request header (fallback for dev)
 */

import { Router } from "express";
import { generateAllExplanations } from "../services/claudeApi.js";
import type { ExplainRequest, ExplainResponse } from "../types.js";

const router = Router();

router.post("/", async (req, res) => {
  const body = req.body as ExplainRequest;

  if (!body.mistakes || !Array.isArray(body.mistakes) || body.mistakes.length === 0) {
    res.status(400).json({ error: "Missing or empty 'mistakes' array" });
    return;
  }

  // Get API key from server env
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    res.status(400).json({
      error: "No API key available. Set OPENROUTER_API_KEY on the server.",
    });
    return;
  }

  const model = (req.query.model as string) || "anthropic/claude-haiku-4-5";

  try {
    const explanations = await generateAllExplanations(
      body.mistakes,
      apiKey,
      model,
    );

    const response: ExplainResponse = { explanations };
    res.json(response);
  } catch (err) {
    console.error("Explain error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to generate explanations",
    });
  }
});

export default router;
