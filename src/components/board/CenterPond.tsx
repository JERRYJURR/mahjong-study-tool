import type { BoardState } from "../../data/types";
import DiscardPond from "../tiles/DiscardPond";

interface CenterPondProps {
  data: BoardState;
}

function WindIndicator({
  roundWind,
  turnNumber,
}: {
  roundWind: string;
  turnNumber: number;
}) {
  const windKanji =
    roundWind === "East" ? "東" : roundWind === "South" ? "南" : "西";
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 6,
        background: "linear-gradient(135deg,#18181b 0%,#0f0f12 100%)",
        border: "1px solid #1f1f23",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#3f3f46",
          fontFamily: "'Noto Serif',serif",
        }}
      >
        {windKanji}
      </span>
      <span
        style={{
          fontSize: 7,
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
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: 10,
        background: "rgba(255,255,255,0.015)",
        borderRadius: 8,
        border: "1px solid #141416",
      }}
    >
      {/* Toimen discards (top) */}
      <DiscardPond
        discards={toimen.discards}
        size="xs"
        riichiTurnIndex={toimen.riichiTurnIndex}
      />

      {/* Middle row: kamicha discards | wind | shimocha discards */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
          <DiscardPond
            discards={kamicha.discards}
            size="xs"
            riichiTurnIndex={kamicha.riichiTurnIndex}
          />
        </div>

        <WindIndicator roundWind={roundWind} turnNumber={turnNumber} />

        <div style={{ display: "flex", justifyContent: "flex-start", flex: 1 }}>
          <DiscardPond
            discards={shimocha.discards}
            size="xs"
            riichiTurnIndex={shimocha.riichiTurnIndex}
          />
        </div>
      </div>

      {/* Your discards (bottom) */}
      <DiscardPond
        discards={you.discards}
        size="xs"
        riichiTurnIndex={you.riichiTurnIndex}
      />
    </div>
  );
}
