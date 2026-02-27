import type { MistakeCategory } from "../data/types";

/** Color for EV diff badge */
export function evColor(ev: number): string {
  if (ev <= -3) return "#f87171";
  if (ev <= -2) return "#fb923c";
  if (ev <= -1.5) return "#fbbf24";
  return "#facc15";
}

/** Category icon mapping */
export const CATEGORY_ICONS: Record<MistakeCategory, string> = {
  "Push/Fold": "\u{1F6E1}\u{FE0F}",
  "Efficiency": "\u26A1",
  "Riichi Decision": "\u{1F3AF}",
  "Calling Decision": "\u{1F4E2}",
  "Defense": "\u{1F9F1}",
};

/** Rank emoji */
export function rankEmoji(rank: number): string {
  return ["\u{1F947}", "\u{1F948}", "\u{1F949}", "4th"][rank - 1] ?? `${rank}th`;
}
