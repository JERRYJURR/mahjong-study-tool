import type { BoardState, PlayerState } from "../../data/types";
import Tile from "../tiles/Tile";
import OpenMeld from "../tiles/OpenMeld";
import CenterPond from "./CenterPond";

interface TableBoardProps {
  data: BoardState;
}

/* Horizontal player info row — used for toimen (top) and you (bottom) */
function PlayerRow({
  player,
  label,
  isYou,
}: {
  player: PlayerState;
  label: string;
  isYou?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "3px 0",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: isYou ? "#22d3ee" : player.isRiichi ? "#f87171" : "#71717a",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      {player.isDealer && (
        <span
          style={{
            fontSize: 7,
            color: "#fbbf24",
            background: "#292524",
            padding: "1px 3px",
            borderRadius: 2,
          }}
        >
          親
        </span>
      )}
      {player.isRiichi && (
        <span
          style={{
            fontSize: 7,
            color: "#f87171",
            background: "#1c1017",
            padding: "1px 3px",
            borderRadius: 2,
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          ⚡立直
        </span>
      )}
      <span
        style={{
          fontSize: 8,
          color: "#52525b",
          fontFamily: "'JetBrains Mono',monospace",
        }}
      >
        {player.seat} · {(player.score ?? 0).toLocaleString()}
      </span>
      {player.openMelds?.length > 0 &&
        player.openMelds.map((m, i) => <OpenMeld key={i} meld={m} size="xs" />)}
    </div>
  );
}

/* Compact vertical side panel — used for kamicha (left) and shimocha (right) */
function SidePanel({
  player,
  label,
}: {
  player: PlayerState;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        minWidth: 44,
        flexShrink: 0,
        padding: "4px 2px",
      }}
    >
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: player.isRiichi ? "#f87171" : "#52525b",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: 7, color: "#3f3f46" }}>{player.seat}</span>
        {player.isDealer && (
          <span style={{ fontSize: 7, color: "#fbbf24" }}>親</span>
        )}
        {player.isRiichi && (
          <span style={{ fontSize: 7, color: "#f87171" }}>⚡</span>
        )}
      </div>
      <span
        style={{
          fontSize: 7,
          color: "#3f3f46",
          fontFamily: "'JetBrains Mono',monospace",
          whiteSpace: "nowrap",
        }}
      >
        {(player.score ?? 0).toLocaleString()}
      </span>
      {player.openMelds?.map((m, i) => (
        <OpenMeld key={i} meld={m} size="xs" />
      ))}
    </div>
  );
}

export default function TableBoard({ data }: TableBoardProps) {
  const { you, kamicha, toimen, shimocha, dora, roundWind, turnNumber, honba } =
    data;

  return (
    <div
      style={{
        background: "#0c0c0f",
        borderRadius: 12,
        border: "1px solid #1a1a1d",
        padding: 16,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 9,
              color: "#3f3f46",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Table
          </span>
          <span style={{ fontSize: 9, color: "#27272a" }}>
            {data.round || `${roundWind} ${turnNumber}`}
            {honba ? ` · ${honba}本` : ""}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#3f3f46" }}>Dora</span>
          <Tile tile={dora} size="sm" />
        </div>
      </div>

      {/* Table body: Toimen → [Kami | Pond | Shimo] → You */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: 6 }}
      >
        {/* Toimen (top) */}
        <PlayerRow player={toimen} label="Toimen" />

        {/* Middle row: Kami | Center Pond | Shimo */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
          <SidePanel player={kamicha} label="Kami" />
          <CenterPond data={data} />
          <SidePanel player={shimocha} label="Shimo" />
        </div>

        {/* You (bottom) */}
        <PlayerRow player={you} label="You" isYou />
      </div>
    </div>
  );
}
