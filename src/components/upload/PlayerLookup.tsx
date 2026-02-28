import { useState, useCallback, useRef } from "react";
import type { KoromoPlayer, FormattedGame } from "../../lib/koromoApi";
import { searchPlayer, getPlayerGames, getMjaiEkyuUrl } from "../../lib/koromoApi";

interface PlayerLookupProps {
  onGameSelect: (uuid: string) => void;
}

type LookupState = "search" | "searching" | "games" | "loading_games";

export default function PlayerLookup({ onGameSelect }: PlayerLookupProps) {
  const [state, setState] = useState<LookupState>("search");
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<KoromoPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<KoromoPlayer | null>(null);
  const [games, setGames] = useState<FormattedGame[]>([]);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setPlayers([]);
      return;
    }

    setState("searching");
    setError(null);

    try {
      const results = await searchPlayer(searchQuery);
      setPlayers(results);
      setState("search");
    } catch {
      setError("Failed to search. amae-koromo API may be unavailable.");
      setState("search");
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => handleSearch(value), 500);
    },
    [handleSearch],
  );

  const handlePlayerSelect = useCallback(async (player: KoromoPlayer) => {
    setSelectedPlayer(player);
    setState("loading_games");
    setError(null);

    try {
      const gameList = await getPlayerGames(player.id, 20);
      setGames(gameList);
      setState("games");
    } catch {
      setError("Failed to load games. amae-koromo API may be unavailable.");
      setState("search");
    }
  }, []);

  const handleBack = useCallback(() => {
    setState("search");
    setSelectedPlayer(null);
    setGames([]);
  }, []);

  // Show games list
  if (state === "games" && selectedPlayer) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button
            onClick={handleBack}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid #1a1a1d",
              background: "transparent",
              color: "#52525b",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Back
          </button>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e4e4e7" }}>
              {selectedPlayer.nickname}
            </span>
            <span style={{ fontSize: 11, color: "#3f3f46", marginLeft: 8 }}>
              {games.length} recent games
            </span>
          </div>
        </div>

        {games.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#3f3f46", fontSize: 12 }}>
            No recent ranked games found.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {games.map((game) => {
            // Find the selected player in this game
            const playerInGame = game.players.find(
              (p) => p.accountId === selectedPlayer.id,
            );

            return (
              <div
                key={game.uuid}
                style={{
                  padding: "10px 14px",
                  borderRadius: 9,
                  background: "#0f0f12",
                  border: "1px solid #1a1a1d",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "border-color 0.15s",
                }}
              >
                {/* Placement badge */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: placementColor(playerInGame?.placement ?? 0),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#fff",
                    fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0,
                  }}
                >
                  {playerInGame?.placement ?? "?"}
                </div>

                {/* Game info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>
                      {game.mode}
                    </span>
                    <span style={{ fontSize: 10, color: "#3f3f46" }}>
                      {game.date}
                    </span>
                    <span style={{ fontSize: 10, color: "#27272a" }}>
                      {game.timeAgo}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
                    {game.players.map((p, i) => (
                      <span key={p.accountId}>
                        {i > 0 && " · "}
                        <span
                          style={{
                            color: p.accountId === selectedPlayer.id ? "#22d3ee" : "#52525b",
                            fontWeight: p.accountId === selectedPlayer.id ? 600 : 400,
                          }}
                        >
                          {p.nickname}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, marginLeft: 2 }}>
                          ({p.score > 0 ? "+" : ""}{(p.score / 100).toFixed(0)})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <a
                    href={getMjaiEkyuUrl(game.uuid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(8,145,178,0.25)",
                      background: "rgba(8,145,178,0.08)",
                      color: "#22d3ee",
                      fontSize: 10,
                      fontWeight: 600,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                    title="Analyze on mjai.ekyu.moe"
                  >
                    Analyze
                  </a>
                  <button
                    onClick={() => onGameSelect(game.uuid)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "1px solid #1a1a1d",
                      background: "transparent",
                      color: "#52525b",
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    title="Copy URL to analyze tab"
                  >
                    URL
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Search view
  return (
    <div>
      <p style={{ fontSize: 12, color: "#71717a", marginBottom: 14, lineHeight: 1.5 }}>
        Search for a Mahjong Soul player to see their recent games.
      </p>

      <input
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Enter player name..."
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 9,
          border: "1px solid #1a1a1d",
          background: "#09090b",
          color: "#e4e4e7",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {state === "searching" && (
        <div style={{ textAlign: "center", padding: 20, color: "#52525b", fontSize: 12 }}>
          Searching...
        </div>
      )}

      {state === "loading_games" && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div
            style={{
              width: 18,
              height: 18,
              border: "2.5px solid #1a1a1d",
              borderTopColor: "#22d3ee",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 8px",
            }}
          />
          <span style={{ fontSize: 12, color: "#52525b" }}>
            Loading games for {selectedPlayer?.nickname}...
          </span>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Player results */}
      {players.length > 0 && state === "search" && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => handlePlayerSelect(player)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #1a1a1d",
                background: "#0f0f12",
                color: "#e4e4e7",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                width: "100%",
                transition: "border-color 0.15s",
              }}
            >
              <span style={{ fontWeight: 600 }}>{player.nickname}</span>
              <span style={{ fontSize: 10, color: "#3f3f46" }}>
                {player.latest_timestamp
                  ? new Date(player.latest_timestamp * 1000).toLocaleDateString()
                  : ""}
              </span>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && players.length === 0 && state === "search" && (
        <div style={{ textAlign: "center", padding: 20, color: "#3f3f46", fontSize: 12 }}>
          No players found for "{query}"
        </div>
      )}
    </div>
  );
}

function placementColor(placement: number): string {
  switch (placement) {
    case 1: return "#ca8a04";
    case 2: return "#6b7280";
    case 3: return "#92400e";
    case 4: return "#991b1b";
    default: return "#27272a";
  }
}
