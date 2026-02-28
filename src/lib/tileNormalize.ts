/**
 * Tile notation normalization between mjai format and app format.
 *
 * mjai may use: "E","S","W","N" for winds; "P","F","C" for dragons;
 *               "5mr","5pr","5sr" for red fives
 * App uses:     "1z"-"4z" for winds; "5z"-"7z" for dragons;
 *               "0m","0p","0s" for red fives
 *
 * Some mjai logs already use the app format ("1z", "0m") — we handle both.
 */

import type { TileNotation, Wind } from "../data/types";

/** Map mjai honor/special notation → app notation */
const MJAI_TO_APP: Record<string, TileNotation> = {
  // Winds
  E: "1z",
  S: "2z",
  W: "3z",
  N: "4z",
  // Dragons
  P: "5z",  // haku (white)
  F: "6z",  // hatsu (green)
  C: "7z",  // chun (red)
  // Red fives (r suffix style)
  "5mr": "0m",
  "5pr": "0p",
  "5sr": "0s",
  // Red fives (already correct)
  "0m": "0m",
  "0p": "0p",
  "0s": "0s",
};

/** Normalize a single mjai tile to app notation */
export function normalizeTile(mjaiTile: string): TileNotation {
  if (MJAI_TO_APP[mjaiTile]) {
    return MJAI_TO_APP[mjaiTile];
  }
  // Already in app format (e.g., "1m", "5z", "7p")
  return mjaiTile;
}

/** Normalize an array of mjai tiles */
export function normalizeTiles(mjaiTiles: string[]): TileNotation[] {
  return mjaiTiles.map(normalizeTile);
}

/** Convert mjai wind string to app Wind type */
const WIND_MAP: Record<string, Wind> = {
  E: "East",
  S: "South",
  W: "West",
  N: "North",
  East: "East",
  South: "South",
  West: "West",
  North: "North",
};

export function normalizeWind(bakaze: string): Wind {
  return WIND_MAP[bakaze] ?? "East";
}

/**
 * Get the seat wind for a player, given the dealer (oya) index.
 * Dealer is always East. Seats go counterclockwise: East → South → West → North
 */
export function seatToWind(seatIndex: number, dealerIndex: number): Wind {
  const winds: Wind[] = ["East", "South", "West", "North"];
  const offset = (seatIndex - dealerIndex + 4) % 4;
  return winds[offset];
}

/**
 * Convert kyoku number (0-indexed tenhou format) to round string.
 * 0-3 = East 1-4, 4-7 = South 1-4, 8-11 = West 1-4
 */
export function formatRound(kyoku: number, honba: number): string {
  const windNames = ["East", "South", "West"];
  const wind = windNames[Math.floor(kyoku / 4)] ?? "East";
  const num = (kyoku % 4) + 1;
  const base = `${wind} ${num}`;
  return honba > 0 ? `${base} Honba ${honba}` : base;
}

/**
 * Get the dora tile from a dora indicator (marker).
 * In riichi mahjong, dora is the next tile after the indicator.
 */
export function doraFromIndicator(indicator: string): TileNotation {
  const tile = normalizeTile(indicator);
  const suit = tile.slice(-1);
  const num = parseInt(tile.slice(0, -1), 10);

  if (suit === "z") {
    // Winds: 1→2→3→4→1
    if (num <= 4) return `${(num % 4) + 1}z`;
    // Dragons: 5→6→7→5
    return `${((num - 5 + 1) % 3) + 5}z`;
  }

  // Number tiles: 9 wraps to 1, 0 (red five) indicates 5 → next is 6
  if (num === 0) return `6${suit}`;
  if (num === 9) return `1${suit}`;
  return `${num + 1}${suit}`;
}
