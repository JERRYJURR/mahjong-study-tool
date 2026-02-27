import type { BoardState, PlayerState } from "../../data/types";
import Tile from "../tiles/Tile";
import OpenMeld from "../tiles/OpenMeld";
import HandBacks from "../tiles/HandBacks";
import SeatBadge from "./SeatBadge";
import CenterPond from "./CenterPond";

interface TableBoardProps {
  data: BoardState;
}

function OpponentHand({ player }: { player: PlayerState }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {player.openMelds?.map((m, i) => <OpenMeld key={i} meld={m} size="xs" />)}
      <HandBacks count={player.closedHandCount || 13} size="xs" />
    </div>
  );
}

export default function TableBoard({ data }: TableBoardProps) {
  const { you, kamicha, toimen, shimocha, dora, roundWind, turnNumber, honba } = data;

  return (
    <div style={{ background: "#0c0c0f", borderRadius: 12, border: "1px solid #1a1a1d", padding: 14, overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: "#3f3f46", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Table
          </span>
          <span style={{ fontSize: 9, color: "#27272a" }}>
            {data.round || `${roundWind} ${turnNumber}`}
            {honba ? ` \u00B7 ${honba}\u672C` : ""}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#3f3f46" }}>Dora</span>
          <Tile tile={dora} size="sm" />
        </div>
      </div>

      {/* Main table grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gridTemplateRows: "auto 1fr auto",
          gridTemplateAreas: `
            ".         toimen     ."
            "kamicha   center     shimocha"
            ".         you        ."
          `,
          gap: 6,
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {/* Toimen (top) */}
        <div style={{ gridArea: "toimen", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <SeatBadge
            label="Toimen"
            seat={toimen.seat}
            score={toimen.score}
            isRiichi={toimen.isRiichi}
            isDealer={toimen.isDealer}
            compact
          />
          <div style={{ transform: "rotate(180deg)" }}>
            <OpponentHand player={toimen} />
          </div>
        </div>

        {/* Kamicha (left) */}
        <div
          style={{
            gridArea: "kamicha",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            transform: "rotate(90deg)",
            transformOrigin: "center center",
          }}
        >
          <SeatBadge
            label="Kami"
            seat={kamicha.seat}
            score={kamicha.score}
            isRiichi={kamicha.isRiichi}
            isDealer={kamicha.isDealer}
            compact
          />
          <OpponentHand player={kamicha} />
        </div>

        {/* Center pond */}
        <CenterPond data={data} />

        {/* Shimocha (right) */}
        <div
          style={{
            gridArea: "shimocha",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            transform: "rotate(-90deg)",
            transformOrigin: "center center",
          }}
        >
          <SeatBadge
            label="Shimo"
            seat={shimocha.seat}
            score={shimocha.score}
            isRiichi={shimocha.isRiichi}
            isDealer={shimocha.isDealer}
            compact
          />
          <OpponentHand player={shimocha} />
        </div>

        {/* You (bottom) */}
        <div style={{ gridArea: "you", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          {you.openMelds?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {you.openMelds.map((m, i) => <OpenMeld key={i} meld={m} size="xs" />)}
            </div>
          )}
          <SeatBadge
            label="You"
            seat={you.seat}
            score={you.score}
            isYou
            isRiichi={you.isRiichi}
            isDealer={you.isDealer}
            compact
          />
        </div>
      </div>
    </div>
  );
}
