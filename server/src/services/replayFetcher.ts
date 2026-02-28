/**
 * Mahjong Soul replay fetching.
 *
 * Approaches (in priority order):
 * 1. Direct HTTP fetch of paipu data (works for some public replays)
 * 2. amae-koromo API for game metadata (public, no auth)
 * 3. Future: mjsoul npm package for WebSocket-based fetching (requires auth)
 *
 * For now, we support submitting replay URLs/IDs and looking up players
 * via amae-koromo. The actual replay log fetching requires the user to
 * either upload the file directly or use the mjai.ekyu.moe service.
 */

import type { PlayerSearchResult, GameRecord } from "../types.js";

// ── amae-koromo API ──────────────────────────────────────────────────

const KOROMO_MIRRORS = [
  "https://5-data.amae-koromo.com",
  "https://1.data.amae-koromo.com",
  "https://2.data.amae-koromo.com",
  "https://3.data.amae-koromo.com",
  "https://4.data.amae-koromo.com",
];

// Default game modes: Gold/Jade/Throne in East and South
const DEFAULT_MODES = "16.15.12.11.9.8";

let currentMirror = 0;

async function koromoFetch(path: string): Promise<unknown> {
  // Try each mirror until one works
  for (let attempt = 0; attempt < KOROMO_MIRRORS.length; attempt++) {
    const mirrorIdx = (currentMirror + attempt) % KOROMO_MIRRORS.length;
    const url = `${KOROMO_MIRRORS[mirrorIdx]}/api/v2/pl4/${path}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          Origin: "https://amae-koromo.sapk.ch",
          Referer: "https://amae-koromo.sapk.ch/",
        },
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 503) {
          // Cloudflare block — try next mirror
          continue;
        }
        throw new Error(`amae-koromo API error ${response.status}: ${response.statusText}`);
      }

      currentMirror = mirrorIdx; // remember working mirror
      return await response.json();
    } catch (err) {
      if (attempt === KOROMO_MIRRORS.length - 1) {
        throw err;
      }
      // Try next mirror
    }
  }

  throw new Error("All amae-koromo mirrors failed");
}

/**
 * Search for a Mahjong Soul player by name.
 */
export async function searchPlayer(
  namePrefix: string,
  limit = 20,
): Promise<PlayerSearchResult[]> {
  const encoded = encodeURIComponent(namePrefix);
  const data = await koromoFetch(`search_player/${encoded}?limit=${limit}&tag=all`);
  return data as PlayerSearchResult[];
}

/**
 * Get recent game records for a player.
 */
export async function getPlayerGames(
  playerId: number,
  limit = 20,
  modes = DEFAULT_MODES,
): Promise<GameRecord[]> {
  const now = Date.now();
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;

  const data = await koromoFetch(
    `player_records/${playerId}/${now}/${yearAgo}?limit=${limit}&mode=${modes}&descending=true`,
  );

  return data as GameRecord[];
}

// ── Paipu ID parsing ─────────────────────────────────────────────────

/**
 * Extract paipu ID from a Mahjong Soul replay URL.
 *
 * Supported formats:
 * - https://game.mahjongsoul.com/?paipu=XXXXXX
 * - https://game.maj-soul.com/1/?paipu=XXXXXX_aYYYYYYY
 * - Just the raw paipu ID
 */
export function extractPaipuId(input: string): string {
  const trimmed = input.trim();

  // Try to parse as URL
  try {
    const url = new URL(trimmed);
    const paipu = url.searchParams.get("paipu");
    if (paipu) {
      // Strip the _aXXXXXXXX player suffix if present
      return paipu.split("_a")[0];
    }
  } catch {
    // Not a URL — treat as raw ID
  }

  // Strip _a suffix if present
  return trimmed.split("_a")[0];
}

/**
 * Extract player account ID from a Mahjong Soul replay URL.
 * Returns undefined if not present.
 *
 * URL format: ?paipu=XXXXX_a{encoded}
 * Decoding: accountId = ((encoded ^ 86216345) - 1117113) / 7
 */
export function extractPlayerFromUrl(input: string): number | undefined {
  const trimmed = input.trim();

  try {
    const url = new URL(trimmed);
    const paipu = url.searchParams.get("paipu");
    if (paipu) {
      const parts = paipu.split("_a");
      if (parts.length >= 2 && parts[1]) {
        const encoded = parseInt(parts[1], 10);
        if (!isNaN(encoded)) {
          const accountId = ((encoded ^ 86216345) - 1117113) / 7;
          if (Number.isInteger(accountId) && accountId > 0) {
            return accountId;
          }
        }
      }
    }
  } catch {
    // Not a URL
  }

  return undefined;
}
