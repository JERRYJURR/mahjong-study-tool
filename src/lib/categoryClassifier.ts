/**
 * Heuristic classification of mistakes into categories.
 * Mortal doesn't label mistakes — we infer from context.
 */

import type { MortalEntry } from "../data/mortalTypes";
import type { MistakeCategory } from "../data/types";
import type { GameSnapshot } from "./gameStateTracker";

/**
 * Classify a mistake based on the entry context and board state.
 * Priority: Riichi → Calling → Defense/Push-Fold → Efficiency
 */
export function classifyMistake(
  entry: MortalEntry,
  snapshot: GameSnapshot,
  reviewedPlayer: number,
): MistakeCategory {
  // 1. Riichi Decision — entry is at a riichi decision point,
  //    or the expected/actual action involves riichi
  if (entry.at_self_riichi) {
    return "Riichi Decision";
  }
  if (
    entry.expected.type === "reach" ||
    entry.actual.type === "reach"
  ) {
    return "Riichi Decision";
  }

  // 2. Calling Decision — player had the option to call chi/pon/kan
  if (entry.at_self_chi_pon) {
    return "Calling Decision";
  }
  if (
    entry.expected.type === "chi" ||
    entry.expected.type === "pon" ||
    entry.actual.type === "chi" ||
    entry.actual.type === "pon" ||
    entry.actual.type === "none"
  ) {
    return "Calling Decision";
  }

  // 3. Check if any opponent is in riichi — defensive context
  const anyOpponentRiichi = snapshot.players.some(
    (p, i) => i !== reviewedPlayer && p.isRiichi,
  );

  if (anyOpponentRiichi) {
    // Large EV diff with riichi opponent = Push/Fold decision
    // (macro decision: keep going or give up)
    if (entry.shanten >= 2) {
      return "Push/Fold";
    }

    // Closer to tenpai but still made wrong tile choice
    // with defensive implications = Defense
    if (entry.shanten >= 0) {
      return "Defense";
    }

    // Tenpai (shanten = -1) against riichi — push/fold
    return "Push/Fold";
  }

  // 4. Check for open hands suggesting opponents are near tenpai
  const opponentThreat = snapshot.players.some(
    (p, i) =>
      i !== reviewedPlayer &&
      p.openMelds.length >= 2 &&
      p.closedTileCount <= 7,
  );

  if (opponentThreat && entry.shanten >= 2) {
    return "Defense";
  }

  // 5. Default: pure tile efficiency mistake
  return "Efficiency";
}
