import type { MistakeCategory, TileNotation } from "../data/types";

/** Human-readable tile name from mjai notation */
const TILE_NAMES: Record<string, string> = {
  // Winds
  "1z": "Ton",    // 東 East
  "2z": "Nan",    // 南 South
  "3z": "Shaa",   // 西 West
  "4z": "Pei",    // 北 North
  // Dragons
  "5z": "Haku",   // 白
  "6z": "Hatsu",  // 發
  "7z": "Chun",   // 中
};

export function tileName(tile: TileNotation): string {
  if (TILE_NAMES[tile]) return TILE_NAMES[tile];

  const num = tile[0];
  const suit = tile[1];

  const suitName = suit === "m" ? "man" : suit === "p" ? "pin" : suit === "s" ? "sou" : "";
  if (!suitName) return tile;

  // Red fives
  if (num === "0") return `aka ${suitName}`;

  return `${num}${suitName}`;
}

/** Replace all tile notations in a string with human-readable names */
export function humanizeTiles(text: string): string {
  // Match tile patterns: 0-9 followed by m/p/s/z
  return text.replace(/\b([0-9][mpsz])\b/g, (_, t) => tileName(t));
}

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
