/**
 * Service for interacting with mjai.ekyu.moe.
 *
 * mjai.ekyu.moe runs Mortal analysis on Mahjong Soul replays.
 * Users submit replays there (CAPTCHA required), then we can fetch
 * the resulting report JSON automatically.
 */

const BASE_URL = process.env.MJAI_EKYU_BASE_URL || "https://mjai.ekyu.moe";
const TIMEOUT_MS = parseInt(process.env.MJAI_EKYU_TIMEOUT || "30000", 10);
const MAX_RETRIES = 2;

/**
 * Extract report UUID from various mjai.ekyu.moe URL formats.
 *
 * Supported formats:
 * - https://mjai.ekyu.moe/report/abc123.html
 * - https://mjai.ekyu.moe/report/abc123.json
 * - https://mjai.ekyu.moe/report/abc123
 * - Bare UUID: abc123-def456-...
 */
export function extractReportId(input: string): string | null {
  const trimmed = input.trim();

  // Try to parse as a URL
  try {
    const url = new URL(trimmed);
    if (url.hostname === "mjai.ekyu.moe" || url.hostname === "www.mjai.ekyu.moe") {
      // Match /report/{id}.html, /report/{id}.json, or /report/{id}
      const match = url.pathname.match(/^\/report\/([^/.]+)/);
      if (match) return match[1];
    }
  } catch {
    // Not a URL — check if it's a bare UUID
  }

  // Bare UUID pattern (hex with dashes, at least 8 chars)
  if (/^[a-f0-9-]{8,}$/i.test(trimmed) && !trimmed.includes(".")) {
    return trimmed;
  }

  return null;
}

/**
 * Check if a string looks like an mjai.ekyu.moe report URL.
 */
export function isMjaiReportUrl(input: string): boolean {
  return extractReportId(input) !== null;
}

/**
 * Fetch a report JSON from mjai.ekyu.moe.
 *
 * The report contains the Mortal review data (kyokus with entries)
 * and the mjai event log.
 */
export async function fetchReport(reportId: string): Promise<MjaiReport> {
  const url = `${BASE_URL}/report/${reportId}.json`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 1s, 2s
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "mahjong-study-tool/1.0",
        },
      });

      clearTimeout(timer);

      if (response.status === 404) {
        throw new MjaiServiceError(
          "Report not found. It may have expired or the URL is incorrect.",
          "NOT_FOUND",
        );
      }

      if (response.status === 403 || response.status === 503) {
        throw new MjaiServiceError(
          "Request blocked by Cloudflare. Please try again in a moment.",
          "CLOUDFLARE_BLOCK",
        );
      }

      if (!response.ok) {
        throw new MjaiServiceError(
          `mjai.ekyu.moe returned status ${response.status}`,
          "HTTP_ERROR",
        );
      }

      const data = await response.json();

      // Log the raw shape during development to help verify the format
      console.log(`[mjaiService] Fetched report ${reportId}, keys:`, Object.keys(data));

      return parseReportResponse(data, reportId);
    } catch (err) {
      if (err instanceof MjaiServiceError) {
        // Don't retry on 404 — the report doesn't exist
        if (err.code === "NOT_FOUND") throw err;
      }

      lastError = err instanceof Error ? err : new Error(String(err));

      if (err instanceof DOMException && err.name === "AbortError") {
        lastError = new MjaiServiceError(
          "Request to mjai.ekyu.moe timed out. Please try again.",
          "TIMEOUT",
        );
      }

      // Retry on network/timeout/Cloudflare errors
      if (attempt === MAX_RETRIES) break;
    }
  }

  throw lastError ?? new MjaiServiceError("Failed to fetch report", "UNKNOWN");
}

/**
 * Build a pre-filled mjai.ekyu.moe submit URL for a Mahjong Soul paipu ID.
 */
export function buildSubmitUrl(paipuId: string): string {
  return `${BASE_URL}/?q=${encodeURIComponent(paipuId)}`;
}

// ── Response parsing ─────────────────────────────────────────────────

export interface MjaiReport {
  /** The Mortal review data (contains kyokus array) */
  review: Record<string, unknown>;
  /** The mjai event log */
  mjaiLog: Record<string, unknown>[];
  /** Player seat that was reviewed */
  player?: number;
  /** Raw response for debugging */
  rawKeys: string[];
}

/**
 * Parse the report JSON response into our expected format.
 *
 * mjai.ekyu.moe report JSON structure (verified):
 * - Top-level object IS the Mortal review (has "kyokus", "total_reviewed", etc.)
 * - The mjai event log is embedded within each kyoku's data
 *
 * Alternatively, the response may wrap things differently.
 * We handle both cases here.
 */
function parseReportResponse(data: unknown, reportId: string): MjaiReport {
  if (!data || typeof data !== "object") {
    throw new MjaiServiceError("Invalid report data: not an object", "PARSE_ERROR");
  }

  const obj = data as Record<string, unknown>;
  const keys = Object.keys(obj);

  // Case 1: The response IS the Mortal review directly (has "kyokus")
  if (Array.isArray(obj.kyokus)) {
    // Extract mjai log from the review data if embedded
    const mjaiLog = extractMjaiLog(obj);

    return {
      review: obj,
      mjaiLog,
      player: typeof obj.reviewed_player === "number" ? obj.reviewed_player : undefined,
      rawKeys: keys,
    };
  }

  // Case 2: The response wraps review and log separately
  if (obj.review && typeof obj.review === "object") {
    const review = obj.review as Record<string, unknown>;
    const mjaiLog = Array.isArray(obj.mjai_log)
      ? (obj.mjai_log as Record<string, unknown>[])
      : Array.isArray(obj.log)
        ? (obj.log as Record<string, unknown>[])
        : extractMjaiLog(review);

    return {
      review,
      mjaiLog,
      player: typeof obj.player === "number"
        ? obj.player
        : typeof review.reviewed_player === "number"
          ? (review.reviewed_player as number)
          : undefined,
      rawKeys: keys,
    };
  }

  // Case 3: Unknown format — return as-is and let the frontend try to parse
  console.warn(
    `[mjaiService] Unknown report format for ${reportId}. Keys: ${keys.join(", ")}`,
  );

  return {
    review: obj,
    mjaiLog: [],
    rawKeys: keys,
  };
}

/**
 * Extract mjai event log from Mortal review data.
 * The log may be embedded in kyoku data or in a separate field.
 */
function extractMjaiLog(review: Record<string, unknown>): Record<string, unknown>[] {
  // Check for a top-level log field
  if (Array.isArray(review.mjai_log)) {
    return review.mjai_log as Record<string, unknown>[];
  }
  if (Array.isArray(review.log)) {
    return review.log as Record<string, unknown>[];
  }

  // Try to reconstruct from kyoku data
  if (Array.isArray(review.kyokus)) {
    const events: Record<string, unknown>[] = [];
    for (const kyoku of review.kyokus as Record<string, unknown>[]) {
      if (Array.isArray(kyoku.log)) {
        events.push(...(kyoku.log as Record<string, unknown>[]));
      }
      if (Array.isArray(kyoku.events)) {
        events.push(...(kyoku.events as Record<string, unknown>[]));
      }
    }
    if (events.length > 0) return events;
  }

  return [];
}

// ── Error types ──────────────────────────────────────────────────────

export type MjaiErrorCode =
  | "NOT_FOUND"
  | "CLOUDFLARE_BLOCK"
  | "HTTP_ERROR"
  | "TIMEOUT"
  | "PARSE_ERROR"
  | "UNKNOWN";

export class MjaiServiceError extends Error {
  constructor(
    message: string,
    public readonly code: MjaiErrorCode,
  ) {
    super(message);
    this.name = "MjaiServiceError";
  }
}
