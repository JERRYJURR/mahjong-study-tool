/**
 * Mortal/mjai-reviewer integration.
 *
 * Shells out to the mjai-reviewer CLI with --json flag.
 * Supports two engines:
 *   - mortal (fast, ~10s, but requires model weights that are NOT publicly available)
 *   - akochan (slow, ~10-60min, fully open source)
 *
 * If neither is available locally, falls back to the hosted mjai.ekyu.moe service.
 */

import { spawn } from "child_process";
import { writeFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import type { MjaiEventRaw, MortalReviewRaw, PipelineOutput } from "../types.js";

export interface RunnerConfig {
  /** Path to mjai-reviewer binary (default: "mjai-reviewer") */
  binaryPath: string;
  /** Engine to use: "mortal" or "akochan" */
  engine: "mortal" | "akochan";
  /** Path to mortal binary (for mortal engine) */
  mortalExe?: string;
  /** Path to mortal config.toml (for mortal engine) */
  mortalCfg?: string;
  /** Path to akochan directory (for akochan engine) */
  akochanDir?: string;
}

const DEFAULT_CONFIG: RunnerConfig = {
  binaryPath: process.env.MJAI_REVIEWER_PATH || "mjai-reviewer",
  engine: (process.env.MJAI_ENGINE as "mortal" | "akochan") || "mortal",
  mortalExe: process.env.MORTAL_EXE || "./mortal/mortal",
  mortalCfg: process.env.MORTAL_CFG || "./mortal/config.toml",
  akochanDir: process.env.AKOCHAN_DIR || "./akochan",
};

/**
 * Run mjai-reviewer on a tenhou.net/6 format log file.
 *
 * @param tenhouLog The tenhou.net/6 format JSON (single JSON object)
 * @param playerSeat Player to review (0-3)
 * @param config Optional runner config
 * @returns PipelineOutput with mjai_log and review
 */
export async function runMjaiReviewer(
  tenhouLog: unknown,
  playerSeat: number,
  config: RunnerConfig = DEFAULT_CONFIG,
): Promise<PipelineOutput> {
  // Write the log to a temp file
  const tmpDir = await mkdtemp(join(tmpdir(), "mjai-"));
  const inputFile = join(tmpDir, "input.json");
  const outputFile = join(tmpDir, "output.json");
  const mjaiOutFile = join(tmpDir, "mjai.json");

  try {
    await writeFile(inputFile, JSON.stringify(tenhouLog));

    // Build command arguments
    const args = [
      "-i", inputFile,
      "-a", String(playerSeat),
      "-e", config.engine,
      "--json",
      "-o", outputFile,
      "--mjai-out", mjaiOutFile,
    ];

    // Add engine-specific args
    if (config.engine === "mortal") {
      if (config.mortalExe) args.push("--mortal-exe", config.mortalExe);
      if (config.mortalCfg) args.push("--mortal-cfg", config.mortalCfg);
    } else if (config.engine === "akochan") {
      if (config.akochanDir) args.push("--akochan-dir", config.akochanDir);
    }

    // Run mjai-reviewer
    const result = await execCommand(config.binaryPath, args);

    if (result.exitCode !== 0) {
      throw new Error(
        `mjai-reviewer exited with code ${result.exitCode}: ${result.stderr}`,
      );
    }

    // Read outputs
    const { readFile } = await import("fs/promises");
    const outputJson = await readFile(outputFile, "utf-8");
    const mjaiJson = await readFile(mjaiOutFile, "utf-8");

    // Parse the JSON output (mjai-reviewer --json gives us the full View struct)
    const reviewOutput = JSON.parse(outputJson);

    // Parse mjai log (newline-delimited JSON)
    const mjaiLog: MjaiEventRaw[] = mjaiJson
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));

    // Extract the review portion from the mjai-reviewer output
    const review: MortalReviewRaw = reviewOutput.review ?? reviewOutput;

    return {
      mjaiLog,
      review,
      meta: {
        playerSeat,
      },
    };
  } finally {
    // Cleanup temp files
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Check if mjai-reviewer is available on this system.
 */
export async function checkMjaiReviewerAvailable(
  config: RunnerConfig = DEFAULT_CONFIG,
): Promise<boolean> {
  try {
    const result = await execCommand(config.binaryPath, ["--version"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

// ── Internal helpers ─────────────────────────────────────────────────

interface ExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function execCommand(
  command: string,
  args: string[],
  timeoutMs = 600_000, // 10 min default (akochan can be slow)
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
