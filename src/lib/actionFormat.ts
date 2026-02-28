/**
 * Format mjai events into human-readable action strings
 * for the yourDiscard and optimalDiscard fields on Mistake.
 */

import type { MjaiEvent } from "../data/mortalTypes";
import { normalizeTile } from "./tileNormalize";

/**
 * Format an action event as a discard tile notation or action description.
 * Returns null for "none" (passed on a call).
 */
export function formatAction(event: MjaiEvent): string | null {
  switch (event.type) {
    case "dahai":
      return normalizeTile(event.pai);

    case "reach":
      // Riichi is declared alongside a discard — the discard tile
      // will be in the next dahai event. For display, we just note riichi.
      return "Riichi";

    case "chi":
      return `Chi ${normalizeTile(event.pai)}`;

    case "pon":
      return `Pon ${normalizeTile(event.pai)}`;

    case "daiminkan":
      return `Kan ${normalizeTile(event.pai)}`;

    case "ankan":
      return `Ankan ${normalizeTile(event.consumed[0])}`;

    case "kakan":
      return `Kakan ${normalizeTile(event.pai)}`;

    case "none":
      return null; // passed on a call

    default:
      return null;
  }
}

/**
 * Format the optimal action with more detail.
 * For calling decisions, includes "→ discard X" if the follow-up is a dahai.
 */
export function formatOptimalAction(
  expected: MjaiEvent,
  details: { action: MjaiEvent }[],
): string {
  const base = formatAction(expected);
  if (!base) return "Pass";

  // For riichi, find the accompanying discard in the details
  if (expected.type === "reach") {
    // Look for a dahai detail that would accompany the riichi
    return `${base}`;
  }

  // For calls (chi/pon), we'd ideally show the follow-up discard
  // but that info isn't directly in the entry. Just show the call.
  if (
    expected.type === "chi" ||
    expected.type === "pon"
  ) {
    return base;
  }

  return base;
}

/**
 * Format both your play and optimal play for display.
 * Handles the common case where both are simple discards,
 * and the special cases for riichi/calls.
 */
export function formatPlays(
  actual: MjaiEvent,
  expected: MjaiEvent,
): { yourDiscard: string | null; optimalDiscard: string } {
  const yourDiscard = formatAction(actual);
  const optimalDiscard = formatAction(expected) ?? "Pass";

  // If expected is riichi but actual is dahai, show "X (with riichi)"
  if (expected.type === "reach" && actual.type === "dahai") {
    return {
      yourDiscard,
      optimalDiscard: `${normalizeTile(actual.pai)} (with riichi)`,
    };
  }

  // If actual is dahai and expected is reach
  if (actual.type === "dahai" && expected.type === "reach") {
    return {
      yourDiscard,
      optimalDiscard: `${yourDiscard} (with riichi)`,
    };
  }

  return { yourDiscard, optimalDiscard };
}
