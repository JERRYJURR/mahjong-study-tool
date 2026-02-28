/**
 * Client-side amae-koromo API for player lookup.
 * Called from the browser (CORS is allowed from browser origins).
 */

// ── Types ────────────────────────────────────────────────────────────

export interface KoromoPlayer {
  id: number;
  nickname: string;
  level: { id: number; score: number; delta: number };
  latest_timestamp: number;
}

export interface KoromoGame {
  uuid: string;
  startTime: number;
  endTime: number;
  modeId: number;
  players: KoromoGamePlayer[];
}

export interface KoromoGamePlayer {
  accountId: number;
  nickname: string;
  level: number;
  score: number;
  gradingScore?: number;
}

// ── Formatted types for display ──────────────────────────────────────

export interface FormattedGame {
  uuid: string;
  date: string;
  timeAgo: string;
  mode: string;
  players: {
    accountId: number;
    nickname: string;
    score: number;
    placement: number;
  }[];
}

// ── API ──────────────────────────────────────────────────────────────

const MIRRORS = [
  "https://5-data.amae-koromo.com",
  "https://1.data.amae-koromo.com",
  "https://2.data.amae-koromo.com",
  "https://3.data.amae-koromo.com",
  "https://4.data.amae-koromo.com",
];

const DEFAULT_MODES = "16.15.12.11.9.8";

let currentMirror = 0;

async function koromoFetch(path: string): Promise<unknown> {
  for (let attempt = 0; attempt < MIRRORS.length; attempt++) {
    const idx = (currentMirror + attempt) % MIRRORS.length;
    const url = `${MIRRORS[idx]}/api/v2/pl4/${path}`;

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 503) continue;
        throw new Error(`API error ${response.status}`);
      }

      currentMirror = idx;
      return await response.json();
    } catch (err) {
      if (attempt === MIRRORS.length - 1) throw err;
    }
  }
  throw new Error("All amae-koromo mirrors failed");
}

/**
 * Search for a player by name prefix.
 */
export async function searchPlayer(query: string): Promise<KoromoPlayer[]> {
  const encoded = encodeURIComponent(query);
  return (await koromoFetch(`search_player/${encoded}?limit=20&tag=all`)) as KoromoPlayer[];
}

/**
 * Get recent games for a player.
 */
export async function getPlayerGames(
  playerId: number,
  limit = 20,
): Promise<FormattedGame[]> {
  const now = Date.now();
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;

  const games = (await koromoFetch(
    `player_records/${playerId}/${now}/${yearAgo}?limit=${limit}&mode=${DEFAULT_MODES}&descending=true`,
  )) as KoromoGame[];

  return games.map((g) => ({
    uuid: g.uuid,
    date: new Date(g.startTime * 1000).toLocaleDateString(),
    timeAgo: formatTimeAgo(g.startTime * 1000),
    mode: formatGameMode(g.modeId),
    players: g.players
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({
        accountId: p.accountId,
        nickname: p.nickname,
        score: p.score,
        placement: i + 1,
      })),
  }));
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatGameMode(modeId: number): string {
  const MODES: Record<number, string> = {
    8: "Gold E", 9: "Gold S",
    11: "Jade E", 12: "Jade S",
    15: "Throne E", 16: "Throne S",
  };
  return MODES[modeId] ?? `Mode ${modeId}`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

/**
 * Build the mjai.ekyu.moe analysis URL for a Mahjong Soul replay.
 */
export function getMjaiEkyuUrl(paipuId: string): string {
  return `https://mjai.ekyu.moe/review/?game_id=${encodeURIComponent(paipuId)}&game_type=majsoul`;
}

/**
 * Build the Mahjong Soul replay URL from a paipu ID.
 */
export function getMajsoulReplayUrl(uuid: string): string {
  return `https://game.mahjongsoul.com/?paipu=${uuid}`;
}
