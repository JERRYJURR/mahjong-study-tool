import type { TileSize } from "../data/types";

/** Pinzu dot center positions (in a 28×38 coordinate space) */
export const PIN_LAYOUTS: Record<number, [number, number][]> = {
  1: [[14, 19]],
  2: [[14, 11], [14, 27]],
  3: [[14, 9], [14, 19], [14, 29]],
  4: [[8, 11], [20, 11], [8, 27], [20, 27]],
  5: [[8, 10], [20, 10], [14, 19], [8, 28], [20, 28]],
  6: [[8, 9], [20, 9], [8, 19], [20, 19], [8, 29], [20, 29]],
  7: [[8, 8], [20, 8], [8, 17], [20, 17], [14, 24], [8, 31], [20, 31]],
  8: [[8, 7], [20, 7], [8, 15], [20, 15], [8, 23], [20, 23], [8, 31], [20, 31]],
  9: [[7, 7], [14, 7], [21, 7], [7, 17], [14, 17], [21, 17], [7, 27], [14, 27], [21, 27]],
};

/** Souzu stick x-positions (in a 28-wide coordinate space). "bird" for 1s. */
export const SOU_LAYOUTS: Record<number, number[] | "bird"> = {
  1: "bird",
  2: [10, 18],
  3: [7, 14, 21],
  4: [7, 12, 16, 21],
  5: [6, 10, 14, 18, 22],
  6: [6, 10, 14, 18, 22, 26],
  7: [5, 9, 12, 15, 18, 21, 25],
  8: [5, 8, 11, 14, 17, 20, 23, 26],
  9: [4, 7, 10, 13, 16, 19, 22, 25, 28],
};

/** Manzu kanji characters */
export const MAN_KANJI: Record<number, string> = {
  1: "一", 2: "二", 3: "三", 4: "四", 5: "五",
  6: "六", 7: "七", 8: "八", 9: "九",
};

/** Honor tile data */
export interface HonorInfo {
  char: string;
  color: string;
  special?: "haku";
}

export const HONOR_DATA: Record<string, HonorInfo> = {
  "1z": { char: "東", color: "#1565C0" },
  "2z": { char: "南", color: "#1565C0" },
  "3z": { char: "西", color: "#1565C0" },
  "4z": { char: "北", color: "#1565C0" },
  "5z": { char: "白", color: "#999", special: "haku" },
  "6z": { char: "發", color: "#2E7D32" },
  "7z": { char: "中", color: "#C62828" },
};

/** Tile dimensions by size */
export const TILE_SIZES: Record<TileSize, { w: number; h: number }> = {
  xxs: { w: 22, h: 30 },
  xs: { w: 28, h: 38 },
  sm: { w: 36, h: 49 },
  md: { w: 44, h: 60 },
  lg: { w: 52, h: 71 },
};

/** Parse tile notation into suit and number */
export function parseTile(tile: string): { num: number; suit: string } {
  const suit = tile.slice(-1);
  const num = parseInt(tile.slice(0, -1), 10);
  return { num, suit };
}
