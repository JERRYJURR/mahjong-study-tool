/**
 * Main data pipeline: transforms Mortal review + mjai log into Mistake[].
 */

import type { Mistake, ReplayMetadata, Explanation } from "../data/types";
import type {
  MortalReview,
  MjaiEvent,
  PipelineConfig,
  MortalEntry,
  MortalKyokuReview,
} from "../data/mortalTypes";
import { GameStateTracker } from "./gameStateTracker";
import { normalizeTile, normalizeTiles, formatRound } from "./tileNormalize";
import { classifyMistake } from "./categoryClassifier";
import { deriveImpact } from "./impactDeriver";
import { formatPlays } from "./actionFormat";

export interface PipelineResult {
  mistakes: Mistake[];
  metadata: ReplayMetadata;
  warnings: string[];
}

/**
 * Transform a Mortal review + mjai event log into Mistake[] for the UI.
 */
export function transformReview(
  review: MortalReview,
  mjaiLog: MjaiEvent[],
  config: PipelineConfig,
): PipelineResult {
  const warnings: string[] = [];
  const tracker = new GameStateTracker(mjaiLog);
  const rawMistakes: Mistake[] = [];

  // Set initial scores from first start_kyoku if available
  const firstStart = mjaiLog.find((e) => e.type === "start_kyoku");
  if (firstStart && firstStart.type === "start_kyoku") {
    // mjai start_kyoku doesn't always include scores.
    // Default to 25000 each (standard starting score).
    tracker.setInitialScores([25000, 25000, 25000, 25000]);
  }

  for (const kyokuReview of review.kyokus) {
    // Process each entry in this round
    for (const entry of kyokuReview.entries) {
      // Skip correct plays
      if (entry.is_equal) continue;

      // Compute EV diff from Q-values
      const evDiff = computeEvDiff(entry);
      if (Math.abs(evDiff) < config.minEvDiff) continue;

      // Get board state snapshot
      const snapshot = tracker.getSnapshot(
        kyokuReview.kyoku,
        kyokuReview.honba,
        entry,
        config.reviewedPlayer,
      );

      if (!snapshot) {
        warnings.push(
          `Could not reconstruct board state for ${formatRound(kyokuReview.kyoku, kyokuReview.honba)} turn ${entry.junme}`,
        );
        continue;
      }

      // Convert snapshot to BoardState
      const boardState = tracker.snapshotToBoardState(
        snapshot,
        config.reviewedPlayer,
        entry,
      );

      // Classify mistake category
      const category = classifyMistake(
        entry,
        snapshot,
        config.reviewedPlayer,
      );

      // Derive impact from round outcome
      const impact = deriveImpact(
        kyokuReview,
        entry,
        config.reviewedPlayer,
      );

      // Format action strings
      const { yourDiscard, optimalDiscard } = formatPlays(
        entry.actual,
        entry.expected,
      );

      // Build hand from entry state
      const hand = normalizeTiles(entry.state.tehai);

      // Determine drew tile
      const drew = getDrewTile(entry);

      // Build placeholder explanation
      const explanation = buildPlaceholderExplanation(entry, evDiff);

      rawMistakes.push({
        id: 0, // assigned after sorting
        round: formatRound(kyokuReview.kyoku, kyokuReview.honba),
        turn: entry.junme,
        evDiff,
        category,
        hand,
        drew,
        yourDiscard,
        optimalDiscard,
        boardState,
        impact,
        explanation,
      });
    }

    // Update tracked scores after each round
    updateScoresFromKyoku(tracker, kyokuReview);
  }

  // Sort by |evDiff| descending (biggest mistakes first)
  rawMistakes.sort((a, b) => Math.abs(b.evDiff) - Math.abs(a.evDiff));

  // Take top N
  const topMistakes = rawMistakes.slice(0, config.maxMistakes);

  // Assign sequential IDs
  topMistakes.forEach((m, i) => {
    m.id = i + 1;
  });

  // Build metadata
  const metadata = buildMetadata(review, rawMistakes);

  return { mistakes: topMistakes, metadata, warnings };
}

/** Compute EV difference from Detail Q-values */
function computeEvDiff(entry: MortalEntry): number {
  if (entry.details.length === 0) return 0;

  const bestQ = entry.details[0].q_value;
  const actualIdx = Math.min(entry.actual_index, entry.details.length - 1);
  const actualQ = entry.details[actualIdx].q_value;

  return actualQ - bestQ; // negative when suboptimal
}

/** Get the drew tile from the entry context */
function getDrewTile(entry: MortalEntry): string | null {
  // If this is a calling decision, there's no drew tile
  if (entry.at_self_chi_pon) return null;

  // The tile field on the entry is the draw tile for self-turn decisions
  if (entry.tile) {
    return normalizeTile(entry.tile);
  }

  // If hand has 14 tiles, the last one is the draw
  if (entry.state.tehai.length === 14) {
    return normalizeTile(entry.state.tehai[13]);
  }

  return null;
}

/** Update tracker scores from round outcome */
function updateScoresFromKyoku(
  tracker: GameStateTracker,
  kyokuReview: MortalKyokuReview,
): void {
  for (const ev of kyokuReview.end_status) {
    if (
      (ev.type === "hora" || ev.type === "ryukyoku") &&
      "deltas" in ev &&
      ev.deltas
    ) {
      tracker.updateScores(ev.deltas);
    }
  }
}

/** Build placeholder explanation until Claude API generates real ones */
function buildPlaceholderExplanation(
  entry: MortalEntry,
  evDiff: number,
): Explanation {
  const shantenDesc =
    entry.shanten === -1
      ? "tenpai"
      : entry.shanten === 0
        ? "1 tile from tenpai"
        : `${entry.shanten + 1} tiles from tenpai`;

  const bestProb =
    entry.details.length > 0
      ? (entry.details[0].prob * 100).toFixed(1)
      : "?";

  const actualRank = entry.actual_index + 1;

  return {
    summary: `AI recommended a different play. EV difference: ${evDiff.toFixed(2)}. Your hand was ${shantenDesc}.`,
    details: [
      `Your hand was ${shantenDesc} with ${entry.tiles_left} wall tiles remaining.`,
      `The AI's top choice had ${bestProb}% confidence.`,
      `Your actual play ranked #${actualRank} among ${entry.details.length} candidate actions.`,
      "Detailed explanation will be generated by Claude AI analysis.",
    ],
    principle: "Analysis pending — Claude API integration will provide specific strategic advice.",
  };
}

/** Build ReplayMetadata from review data */
function buildMetadata(
  review: MortalReview,
  allMistakes: Mistake[],
): ReplayMetadata {
  const totalEvLoss = allMistakes.reduce((sum, m) => sum + m.evDiff, 0);

  return {
    date: new Date().toISOString().split("T")[0],
    room: "Unknown",
    mode: "4p",
    result: {
      rank: 0,
      score: 0,
      delta: "—",
    },
    overallAccuracy: review.rating * 100, // rating is 0-1, display as percentage
    totalMistakes: review.total_reviewed - review.total_matches,
    bigMistakes: allMistakes.filter((m) => Math.abs(m.evDiff) >= 1.0).length,
  };
}
