/**
 * Player lookup routes via amae-koromo API.
 *
 * GET /api/players/search?q=<name>     — Search players by name
 * GET /api/players/:id/games           — List recent games for a player
 */

import { Router } from "express";
import { searchPlayer, getPlayerGames } from "../services/replayFetcher.js";

const router = Router();

/**
 * Search for players by name prefix.
 * GET /api/players/search?q=PlayerName&limit=20
 */
router.get("/search", async (req, res) => {
  const query = req.query.q as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

  if (!query || query.length < 2) {
    res.status(400).json({ error: "Query must be at least 2 characters" });
    return;
  }

  try {
    const players = await searchPlayer(query, limit);
    res.json({ players });
  } catch (err) {
    console.error("Player search error:", err);
    res.status(502).json({
      error: "Failed to search players. The amae-koromo API may be unavailable.",
    });
  }
});

/**
 * Get recent games for a player.
 * GET /api/players/:id/games?limit=20
 */
router.get("/:id/games", async (req, res) => {
  const playerId = parseInt(req.params.id);
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

  if (isNaN(playerId) || playerId <= 0) {
    res.status(400).json({ error: "Invalid player ID" });
    return;
  }

  try {
    const games = await getPlayerGames(playerId, limit);

    // Format for frontend display
    const formatted = games.map((g) => ({
      uuid: g.uuid,
      date: new Date(g.startTime * 1000).toISOString(),
      mode: formatGameMode(g.modeId),
      players: g.players.map((p) => ({
        accountId: p.accountId,
        nickname: p.nickname,
        score: p.score,
        placement: g.players
          .slice()
          .sort((a, b) => b.score - a.score)
          .findIndex((x) => x.accountId === p.accountId) + 1,
      })),
    }));

    res.json({ games: formatted });
  } catch (err) {
    console.error("Player games error:", err);
    res.status(502).json({
      error: "Failed to fetch games. The amae-koromo API may be unavailable.",
    });
  }
});

function formatGameMode(modeId: number): string {
  const MODES: Record<number, string> = {
    8: "Gold East",
    9: "Gold South",
    11: "Jade East",
    12: "Jade South",
    15: "Throne East",
    16: "Throne South",
    21: "3P Gold East",
    22: "3P Gold South",
    23: "3P Jade East",
    24: "3P Jade South",
    25: "3P Throne East",
    26: "3P Throne South",
  };
  return MODES[modeId] ?? `Mode ${modeId}`;
}

export default router;
