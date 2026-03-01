/**
 * Mahjong Study Tool — API Server
 *
 * Express server providing:
 * - POST /api/analyze   — Submit a replay for Mortal analysis
 * - GET  /api/jobs/:id  — Poll job status and results
 * - GET  /api/players/* — Player lookup via amae-koromo
 * - POST /api/explain   — Generate Claude AI explanations
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";
import jobsRouter from "./routes/jobs.js";
import gamesRouter from "./routes/games.js";
import explainRouter from "./routes/explain.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

// ── Middleware ────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://127.0.0.1:5173",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));

// ── Routes ───────────────────────────────────────────────────────────

app.use("/api/analyze", analyzeRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/players", gamesRouter);
app.use("/api/explain", explainRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});

// ── Start ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🀄 Mahjong Study API running at http://localhost:${PORT}`);
  console.log(`  📡 CORS origin: ${process.env.CORS_ORIGIN || "http://127.0.0.1:5173"}`);

  if (process.env.OPENROUTER_API_KEY) {
    console.log(`  🤖 OpenRouter API key: configured`);
  } else {
    console.log(`  ⚠️  No OPENROUTER_API_KEY — set it in .env`);
  }

  console.log();
});

export default app;
