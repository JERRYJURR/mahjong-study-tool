import type { BoardState, Meld, PlayerState, TileSize } from "../../data/types";
import { TILE_SIZES } from "../../lib/tileMap";
import Tile from "../tiles/Tile";
import HandBacks from "../tiles/HandBacks";
import OpenMeld from "../tiles/OpenMeld";
import CenterPond from "./CenterPond";

interface TableBoardProps {
  data: BoardState;
}

/* ─── Constants for opponent hand rendering ─── */
const HAND_SIZE: TileSize = "xxs";
const HAND_OVERLAP = 12; // px overlap between facedown tiles

/* ─── Toimen: horizontal player row with hand strip ─── */

function ToimenRow({ player }: { player: PlayerState }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Info badges */}
      <PlayerBadges player={player} label="Toimen" />

      {/* Hand strip: open melds + facedown tiles, rotated 180° */}
      <div style={{ transform: "rotate(180deg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {player.openMelds?.map((m, i) => (
            <OpenMeld key={i} meld={m} size={HAND_SIZE} />
          ))}
          <HandBacks
            count={player.closedHandCount || 13}
            size={HAND_SIZE}
            overlap={HAND_OVERLAP}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Side player: vertical hand column with info ─── */

function SidePanel({
  player,
  label,
}: {
  player: PlayerState;
  label: string;
}) {
  const count = player.closedHandCount || 13;
  const { w: tileW } = TILE_SIZES[HAND_SIZE]; // 22 for xxs

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        flexShrink: 0,
      }}
    >
      {/* Player info */}
      <PlayerBadges player={player} label={label} compact />

      {/* Open melds — small horizontal groups, readable */}
      {player.openMelds?.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {player.openMelds.map((m, i) => (
            <OpenMeld key={i} meld={m} size={HAND_SIZE} />
          ))}
        </div>
      )}

      {/* Facedown tiles — vertical column of sideways tiles */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{ marginTop: i === 0 ? 0 : -(HAND_OVERLAP) }}
          >
            <Tile facedown size={HAND_SIZE} sideways />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── You: bottom info row ─── */

function YouRow({ player }: { player: PlayerState }) {
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
      <PlayerBadges player={player} label="You" isYou />
      {player.openMelds?.length > 0 &&
        player.openMelds.map((m, i) => (
          <OpenMeld key={i} meld={m} size={HAND_SIZE} />
        ))}
    </div>
  );
}

/* ─── Shared badge rendering ─── */

function PlayerBadges({
  player,
  label,
  isYou,
  compact,
}: {
  player: PlayerState;
  label: string;
  isYou?: boolean;
  compact?: boolean;
}) {
  const nameColor = isYou
    ? "#22d3ee"
    : player.isRiichi
    ? "#f87171"
    : "#71717a";

  if (compact) {
    /* Compact vertical layout for side panels */
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: nameColor,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            {label}
          </span>
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
          {player.seat} · {(player.score ?? 0).toLocaleString()}
        </span>
      </div>
    );
  }

  /* Inline horizontal layout for toimen / you rows */
  return (
    <>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: nameColor,
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
    </>
  );
}

/* ─── Main TableBoard ─── */

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
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Toimen (top) */}
        <ToimenRow player={toimen} />

        {/* Middle row: Kami | Center Pond | Shimo */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
          <SidePanel player={kamicha} label="Kami" />
          <CenterPond data={data} />
          <SidePanel player={shimocha} label="Shimo" />
        </div>

        {/* You (bottom) */}
        <YouRow player={you} />
      </div>
    </div>
  );
}
