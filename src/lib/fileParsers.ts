/**
 * Parse uploaded files into typed data structures.
 * Handles both NDJSON (mjai log) and single JSON (Mortal review).
 */

import type { MjaiEvent, MortalReview } from "../data/mortalTypes";

export interface ParseError {
  type: "mjai" | "review";
  message: string;
  line?: number;
}

/**
 * Parse an mjai event log (NDJSON format — one JSON object per line).
 */
export function parseMjaiLog(text: string): { events: MjaiEvent[]; errors: ParseError[] } {
  const events: MjaiEvent[] = [];
  const errors: ParseError[] = [];

  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  for (let i = 0; i < lines.length; i++) {
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed && typeof parsed.type === "string") {
        events.push(parsed as MjaiEvent);
      }
    } catch {
      errors.push({
        type: "mjai",
        message: `Invalid JSON on line ${i + 1}`,
        line: i + 1,
      });
    }
  }

  if (events.length === 0) {
    errors.push({
      type: "mjai",
      message: "No valid mjai events found in file",
    });
  }

  return { events, errors };
}

/**
 * Parse a Mortal review JSON file.
 */
export function parseMortalReview(text: string): { review: MortalReview | null; errors: ParseError[] } {
  const errors: ParseError[] = [];

  try {
    const parsed = JSON.parse(text);

    // Validate required fields
    if (!parsed.kyokus || !Array.isArray(parsed.kyokus)) {
      errors.push({
        type: "review",
        message: 'Missing or invalid "kyokus" array in review data',
      });
      return { review: null, errors };
    }

    if (typeof parsed.total_reviewed !== "number") {
      // Non-critical — fill in a default
      parsed.total_reviewed = 0;
    }
    if (typeof parsed.total_matches !== "number") {
      parsed.total_matches = 0;
    }
    if (typeof parsed.rating !== "number") {
      parsed.rating = 0;
    }

    return { review: parsed as MortalReview, errors };
  } catch {
    errors.push({
      type: "review",
      message: "Invalid JSON in review file",
    });
    return { review: null, errors };
  }
}

/**
 * Auto-detect which uploaded file is the mjai log vs Mortal review.
 * mjai logs are NDJSON (multiple lines each with a JSON object).
 * Mortal reviews are a single JSON object with a "kyokus" key.
 */
export function detectFileType(text: string): "mjai" | "review" | "unknown" {
  const trimmed = text.trim();

  // Quick check: if it starts with { and has "kyokus", it's a review
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.kyokus) return "review";
    } catch {
      // Not valid single JSON — might be NDJSON
    }
  }

  // Check if it looks like NDJSON with mjai events
  const firstLine = trimmed.split("\n")[0]?.trim();
  if (firstLine) {
    try {
      const parsed = JSON.parse(firstLine);
      if (parsed.type === "start_game" || parsed.type === "start_kyoku") {
        return "mjai";
      }
      // Any line with a "type" field suggests mjai
      if (typeof parsed.type === "string") {
        return "mjai";
      }
    } catch {
      // Not JSON at all
    }
  }

  return "unknown";
}
