/**
 * Server-side Claude API integration.
 * Generates mahjong mistake explanations using the Anthropic API directly.
 */

import type { ExplainMistakeInput, ExplanationResult } from "../types.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5";
const ANTHROPIC_VERSION = "2023-06-01";

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

interface PlayerStateData {
  seat: string;
  score: number;
  discards: string[];
  isRiichi: boolean;
  riichiTurnIndex?: number;
  openMelds: Array<{ type: string; tiles: string[] }>;
}

function formatPlayerState(label: string, p: PlayerStateData): string {
  const parts = [
    `${label} (${p.seat}, ${p.score.toLocaleString()}pts)`,
    `  Discards: ${p.discards.length > 0 ? p.discards.join(" ") : "—"}`,
  ];
  if (p.isRiichi) {
    parts.push(`  ⚠ Riichi${p.riichiTurnIndex != null ? ` (turn ${p.riichiTurnIndex + 1})` : ""}`);
  }
  if (p.openMelds.length > 0) {
    const melds = p.openMelds
      .map((m) => `${m.type}(${m.tiles.join("")})`)
      .join(", ");
    parts.push(`  Open melds: ${melds}`);
  }
  return parts.join("\n");
}

function buildPrompt(m: ExplainMistakeInput): string {
  const bs = m.boardState as Record<string, unknown>;
  const kamicha = bs.kamicha as PlayerStateData;
  const toimen = bs.toimen as PlayerStateData;
  const shimocha = bs.shimocha as PlayerStateData;
  const you = bs.you as PlayerStateData;

  const riichiPlayers = [kamicha, toimen, shimocha]
    .filter((p) => p?.isRiichi)
    .map((p) => p.seat);

  const impact = m.impact as Record<string, unknown>;

  return `Analyze this mahjong mistake:

## Situation
- Round: ${m.round}
- Turn: ${m.turn}
- Round wind: ${bs.roundWind ?? "East"}
- Your seat: ${you?.seat ?? "unknown"}
- Dora: ${bs.dora ?? "unknown"}
- Honba: ${bs.honba ?? 0}
${riichiPlayers.length > 0 ? `- Opponents in riichi: ${riichiPlayers.join(", ")}` : "- No opponents in riichi"}

## Your Hand
${m.hand.join(" ")}${m.drew ? `  (drew ${m.drew})` : ""}

## Board State
${kamicha ? formatPlayerState("Kamicha", kamicha) : "Kamicha: unknown"}
${toimen ? formatPlayerState("Toimen", toimen) : "Toimen: unknown"}
${shimocha ? formatPlayerState("Shimocha", shimocha) : "Shimocha: unknown"}

## The Mistake
- Category: ${m.category}
- You played: ${m.yourDiscard ?? "passed"}
- AI recommended: ${m.optimalDiscard}
- EV difference: ${m.evDiff.toFixed(2)}

## Impact
${impact?.description ?? "Unknown impact"}${
    (impact?.pointSwing as Record<string, string>)
      ? `\n- Actual outcome: ${(impact.pointSwing as Record<string, string>).actual}\n- Optimal outcome: ${(impact.pointSwing as Record<string, string>).optimal}`
      : ""
  }

Respond with a JSON object with these exact keys:
{
  "summary": "One clear sentence about the core mistake",
  "details": ["Point 1 about the situation", "Point 2 about why AI's choice is better", "Point 3 about what your choice sacrifices", "Point 4 about what to watch for"],
  "principle": "A memorable one-sentence mahjong guideline"
}`;
}

// ── API call ─────────────────────────────────────────────────────────

function parseExplanation(responseText: string): ExplanationResult {
  const trimmed = responseText.trim();
  const jsonStr = trimmed
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  const parsed = JSON.parse(jsonStr);

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

/**
 * Generate explanation for a single mistake.
 */
export async function generateExplanation(
  mistake: ExplainMistakeInput,
  apiKey: string,
  model = DEFAULT_MODEL,
): Promise<ExplanationResult> {
  const prompt = buildPrompt(mistake);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
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
    const err = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    const errObj = err?.error as Record<string, unknown> | undefined;
    const message =
      (errObj?.message as string) ??
      `API error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const content = data.content as Array<Record<string, unknown>>;
  const textBlock = content?.find((b) => b.type === "text");

  if (!textBlock?.text) {
    throw new Error("No text in API response");
  }

  return parseExplanation(textBlock.text as string);
}

/**
 * Generate explanations for multiple mistakes sequentially.
 */
export async function generateAllExplanations(
  mistakes: ExplainMistakeInput[],
  apiKey: string,
  model = DEFAULT_MODEL,
): Promise<ExplanationResult[]> {
  const results: ExplanationResult[] = [];

  for (const mistake of mistakes) {
    const explanation = await generateExplanation(mistake, apiKey, model);
    results.push(explanation);
  }

  return results;
}
