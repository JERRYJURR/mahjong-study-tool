/**
 * Claude API integration for generating mahjong mistake explanations.
 * Uses raw fetch through Vite's dev proxy to avoid CORS/browser SDK issues.
 */

import type { Mistake, Explanation, PlayerState } from "../data/types";

const API_PATH = "/api/anthropic/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5";
const ANTHROPIC_VERSION = "2023-06-01";

// ── API key persistence ──────────────────────────────────────────────
const STORAGE_KEY = "mahjong-study-claude-api-key";

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function storeApiKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable — ignore
  }
}

// ── System prompt ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert riichi mahjong coach who analyzes mistakes from Mortal AI game reviews. You understand tile efficiency, push/fold theory, hand reading, defense, and all strategic concepts in competitive riichi mahjong.

Your job is to explain WHY a play was suboptimal and what the player should have done differently, in a way that helps them improve.

Rules:
- Be specific about the tiles and board state. Reference actual tiles by notation (e.g. 3p, 7s, East wind).
- Keep explanations practical and actionable.
- The "summary" should be one clear sentence about the core mistake.
- The "details" should be exactly 4 analysis points: (1) what the situation was, (2) why the AI's choice is better, (3) what the player's choice sacrifices, (4) what to watch for in similar situations.
- The "principle" should be a memorable one-sentence mahjong rule/guideline.
- Respond ONLY with a valid JSON object matching the specified schema. No markdown, no code fences, no extra text.`;

// ── Prompt builder ───────────────────────────────────────────────────
function formatPlayerState(label: string, p: PlayerState): string {
  const parts = [
    `${label} (${p.seat}, ${p.score.toLocaleString()}pts)`,
    `  Discards: ${p.discards.length > 0 ? p.discards.join(" ") : "—"}`,
  ];
  if (p.isRiichi) parts.push(`  ⚠ Riichi${p.riichiTurnIndex != null ? ` (turn ${p.riichiTurnIndex + 1})` : ""}`);
  if (p.openMelds.length > 0) {
    const melds = p.openMelds.map((m) => `${m.type}(${m.tiles.join("")})`).join(", ");
    parts.push(`  Open melds: ${melds}`);
  }
  return parts.join("\n");
}

function buildPrompt(m: Mistake): string {
  const bs = m.boardState;
  const riichiPlayers = [bs.kamicha, bs.toimen, bs.shimocha]
    .filter((p) => p.isRiichi)
    .map((p) => p.seat);

  return `Analyze this mahjong mistake:

## Situation
- Round: ${m.round}
- Turn: ${m.turn}
- Round wind: ${bs.roundWind}
- Your seat: ${bs.you.seat}
- Dora: ${bs.dora}
- Honba: ${bs.honba}
${riichiPlayers.length > 0 ? `- Opponents in riichi: ${riichiPlayers.join(", ")}` : "- No opponents in riichi"}

## Your Hand
${m.hand.join(" ")}${m.drew ? `  (drew ${m.drew})` : ""}

## Board State
${formatPlayerState("Kamicha", bs.kamicha)}
${formatPlayerState("Toimen", bs.toimen)}
${formatPlayerState("Shimocha", bs.shimocha)}

## The Mistake
- Category: ${m.category}
- You played: ${m.yourDiscard ?? "passed"}
- AI recommended: ${m.optimalDiscard}
- EV difference: ${m.evDiff.toFixed(2)}

## Impact
${m.impact.description}${m.impact.pointSwing ? `\n- Actual outcome: ${m.impact.pointSwing.actual}\n- Optimal outcome: ${m.impact.pointSwing.optimal}` : ""}

Respond with a JSON object with these exact keys:
{
  "summary": "One clear sentence about the core mistake",
  "details": ["Point 1 about the situation", "Point 2 about why AI's choice is better", "Point 3 about what your choice sacrifices", "Point 4 about what to watch for"],
  "principle": "A memorable one-sentence mahjong guideline"
}`;
}

// ── API call ─────────────────────────────────────────────────────────
function parseExplanation(responseText: string): Explanation {
  // Try to parse the response as JSON directly
  const trimmed = responseText.trim();

  // Strip markdown code fences if present
  const jsonStr = trimmed
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  const parsed = JSON.parse(jsonStr);

  // Validate shape
  if (
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.details) ||
    typeof parsed.principle !== "string"
  ) {
    throw new Error("Response doesn't match expected Explanation shape");
  }

  return {
    summary: parsed.summary,
    details: parsed.details.map(String).slice(0, 4),
    principle: parsed.principle,
  };
}

export interface GenerateOptions {
  apiKey: string;
  model?: string;
}

export async function generateExplanation(
  mistake: Mistake,
  options: GenerateOptions,
): Promise<Explanation> {
  const model = options.model || DEFAULT_MODEL;
  const prompt = buildPrompt(mistake);

  const response = await fetch(API_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": options.apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    const message =
      err?.error?.message ??
      `API error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();

  // Extract text from response content
  const textBlock = data.content?.find(
    (b: { type: string }) => b.type === "text",
  );
  if (!textBlock?.text) {
    throw new Error("No text in API response");
  }

  return parseExplanation(textBlock.text);
}

/**
 * Generate explanations for all mistakes sequentially.
 * Calls onProgress after each one completes.
 */
export async function generateAllExplanations(
  mistakes: Mistake[],
  options: GenerateOptions,
  onProgress: (index: number, explanation: Explanation) => void,
): Promise<void> {
  for (let i = 0; i < mistakes.length; i++) {
    const explanation = await generateExplanation(mistakes[i], options);
    onProgress(i, explanation);
  }
}
