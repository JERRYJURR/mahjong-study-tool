import type { BoardState, PlayerState, TileSize } from "../../data/types";
import Tile from "../tiles/Tile";
import HandBacks from "../tiles/HandBacks";
import OpenMeld from "../tiles/OpenMeld";
import CenterPond from "./CenterPond";
import {
  TEXT_MUTED,
  TEXT_FAINT,
  ACCENT_CYAN,
  BORDER_DEFAULT,
  BG_TABLE,
  FONT_LABEL,
  FONT_MONO,
} from "../../lib/designTokens";

interface TableBoardProps {
  data: BoardState;
  size?: "compact" | "large";
}

/* ─── Toimen: horizontal player row with hand strip ─── */

function ToimenRow({ player, handSize }: { player: PlayerState; handSize: TileSize }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <PlayerBadges player={player} label="Toimen" />
      <div style={{ transform: "rotate(180deg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {player.openMelds?.map((m, i) => (
            <OpenMeld key={i} meld={m} size={handSize} />
          ))}
          <HandBacks
            count={player.closedHandCount || 13}
            size={handSize}
            overlap={12}
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
  handSize,
}: {
  player: PlayerState;
  label: string;
  handSize: TileSize;
}) {
  const count = player.closedHandCount || 13;

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
      <PlayerBadges player={player} label={label} compact />
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
            <OpenMeld key={i} meld={m} size={handSize} />
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{ marginTop: i === 0 ? 0 : -12 }}
          >
            <Tile facedown size={handSize} sideways />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── You: bottom info row ─── */

function YouRow({ player, handSize }: { player: PlayerState; handSize: TileSize }) {
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
          <OpenMeld key={i} meld={m} size={handSize} />
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
    ? ACCENT_CYAN
    : player.isRiichi
    ? "#f87171"
    : TEXT_FAINT;

  if (compact) {
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
              fontSize: FONT_LABEL,
              fontWeight: 700,
              color: nameColor,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            {label}
          </span>
          {player.isDealer && (
            <span style={{ fontSize: FONT_LABEL, color: "#fbbf24" }}>親</span>
          )}
          {player.isRiichi && (
            <span style={{ fontSize: FONT_LABEL, color: "#f87171" }}>⚡</span>
          )}
        </div>
        <span
          style={{
            fontSize: FONT_LABEL,
            color: TEXT_MUTED,
            fontFamily: FONT_MONO,
            whiteSpace: "nowrap",
          }}
        >
          {player.seat} · {(player.score ?? 0).toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <>
      <span
        style={{
          fontSize: FONT_LABEL,
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
            fontSize: FONT_LABEL,
            color: "#fbbf24",
            background: "#292524",
            padding: "1px 4px",
            borderRadius: 2,
          }}
        >
          親
        </span>
      )}
      {player.isRiichi && (
        <span
          style={{
            fontSize: FONT_LABEL,
            color: "#f87171",
            background: "#1c1017",
            padding: "1px 4px",
            borderRadius: 2,
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          ⚡立直
        </span>
      )}
      <span
        style={{
          fontSize: FONT_LABEL,
          color: TEXT_MUTED,
          fontFamily: FONT_MONO,
        }}
      >
        {player.seat} · {(player.score ?? 0).toLocaleString()}
      </span>
    </>
  );
}

/* ─── Main TableBoard ─── */

export default function TableBoard({ data, size = "compact" }: TableBoardProps) {
  const { you, kamicha, toimen, shimocha, dora, roundWind, turnNumber, honba } =
    data;

  const isLarge = size === "large";
  const handSize: TileSize = isLarge ? "xs" : "xxs";
  const doraSize: TileSize = isLarge ? "md" : "sm";
  const padding = isLarge ? 20 : 16;

  return (
    <div
      style={{
        background: BG_TABLE,
        borderRadius: 12,
        border: `1px solid ${BORDER_DEFAULT}`,
        padding,
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
              fontSize: FONT_LABEL,
              color: TEXT_MUTED,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Table
          </span>
          <span style={{ fontSize: FONT_LABEL, color: TEXT_FAINT }}>
            {data.round || `${roundWind} ${turnNumber}`}
            {honba ? ` · ${honba}本` : ""}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: FONT_LABEL, color: TEXT_MUTED }}>Dora</span>
          <Tile tile={dora} size={doraSize} />
        </div>
      </div>

      {/* Table body: Toimen → [Kami | Pond | Shimo] → You */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <ToimenRow player={toimen} handSize={handSize} />
        <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
          <SidePanel player={kamicha} label="Kami" handSize={handSize} />
          <CenterPond data={data} />
          <SidePanel player={shimocha} label="Shimo" handSize={handSize} />
        </div>
        <YouRow player={you} handSize={handSize} />
      </div>
    </div>
  );
}
