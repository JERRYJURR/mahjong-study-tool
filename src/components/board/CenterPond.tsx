import type { BoardState } from "../../data/types";
import DiscardPond from "../tiles/DiscardPond";

interface CenterPondProps {
  data: BoardState;
}

function WindIndicator({ roundWind, turnNumber }: { roundWind: string; turnNumber: number }) {
  const windKanji = roundWind === "East" ? "東" : roundWind === "South" ? "南" : "西";
  return (
    <div
      style={{
        gridArea: "wind",
        width: 52,
        height: 52,
        borderRadius: 8,
        background: "linear-gradient(135deg,#18181b 0%,#0f0f12 100%)",
        border: "1px solid #1f1f23",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#3f3f46",
          fontFamily: "'Noto Serif',serif",
        }}
      >
        {windKanji}
      </span>
      <span
        style={{
          fontSize: 8,
          color: "#27272a",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        T{turnNumber}
      </span>
    </div>
  );
}

export default function CenterPond({ data }: CenterPondProps) {
  const { you, kamicha, toimen, shimocha, roundWind, turnNumber } = data;

  return (
    <div
      style={{
        gridArea: "center",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gridTemplateRows: "auto 1fr auto",
        gridTemplateAreas: `
          ".          tDiscards   ."
          "kDiscards  wind        sDiscards"
          ".          yDiscards   ."
        `,
        gap: 6,
        alignItems: "center",
        justifyItems: "center",
        padding: 6,
        background: "rgba(255,255,255,0.01)",
        borderRadius: 8,
        border: "1px solid #141416",
        minWidth: 240,
      }}
    >
      {/* Toimen discards (top, rotated 180) */}
      <div style={{ gridArea: "tDiscards", transform: "rotate(180deg)" }}>
        <DiscardPond discards={toimen.discards} size="xs" riichiTurnIndex={toimen.riichiTurnIndex} />
      </div>

      {/* Kamicha discards (left, rotated 90) */}
      <div style={{ gridArea: "kDiscards", transform: "rotate(90deg)", transformOrigin: "center center" }}>
        <DiscardPond discards={kamicha.discards} size="xs" riichiTurnIndex={kamicha.riichiTurnIndex} cols={4} />
      </div>

      <WindIndicator roundWind={roundWind} turnNumber={turnNumber} />

      {/* Shimocha discards (right, rotated -90) */}
      <div style={{ gridArea: "sDiscards", transform: "rotate(-90deg)", transformOrigin: "center center" }}>
        <DiscardPond discards={shimocha.discards} size="xs" riichiTurnIndex={shimocha.riichiTurnIndex} cols={4} />
      </div>

      {/* Your discards (bottom, normal) */}
      <div style={{ gridArea: "yDiscards" }}>
        <DiscardPond discards={you.discards} size="xs" riichiTurnIndex={you.riichiTurnIndex} />
      </div>
    </div>
  );
}
