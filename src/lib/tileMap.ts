import type { TileSize } from "../data/types";

/** Tile dimensions by size (width × height in px) */
export const TILE_SIZES: Record<TileSize, { w: number; h: number }> = {
  xxs: { w: 22, h: 30 },
  xs: { w: 28, h: 38 },
  sm: { w: 36, h: 49 },
  md: { w: 44, h: 60 },
  lg: { w: 52, h: 71 },
};

/**
 * All valid tile notations that have corresponding SVG files in /tiles/.
 * Suits: m (manzu), p (pinzu), s (souzu), z (honors)
 * Red fives: 0m, 0p, 0s
 * Special: back (facedown)
 */
const VALID_TILES = new Set([
  "1m","2m","3m","4m","5m","6m","7m","8m","9m",
  "1p","2p","3p","4p","5p","6p","7p","8p","9p",
  "1s","2s","3s","4s","5s","6s","7s","8s","9s",
  "1z","2z","3z","4z","5z","6z","7z",
  "0m","0p","0s",
  "back",
]);

/** Get the SVG path for a tile notation. Returns path relative to public/. */
export function tileSvgPath(tile: string): string {
  if (!VALID_TILES.has(tile)) {
    console.warn(`Unknown tile notation: ${tile}`);
  }
  return `/tiles/${tile}.svg`;
}
