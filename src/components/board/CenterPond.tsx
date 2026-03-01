import type { BoardState } from "../../data/types";
import DiscardPond from "../tiles/DiscardPond";
import {
  TEXT_MUTED,
  BORDER_HOVER,
  FONT_LABEL,
  FONT_SERIF,
} from "../../lib/designTokens";

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
  // 6 xs-tiles per side: 6 × 28 = 168
  const side = 168;
  return (
    <div
      style={{
        width: side,
        height: side,
        borderRadius: 8,
        background: "linear-gradient(135deg,#18181b 0%,#0f0f12 100%)",
        border: `1px solid ${BORDER_HOVER}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: TEXT_MUTED,
          fontFamily: FONT_SERIF,
          lineHeight: 1,
        }}
      >
        {windKanji}
      </span>
      <span
        style={{
          fontSize: 14,
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginTop: 4,
        }}
      >
        T{turnNumber}
      </span>
    </div>
  );
}

// xs tile: 28w × 38h, always reserve 3 rows × 6 cols
const POND_W = 6 * 28;   // 168
const POND_H = 3 * 38;   // 114

function RotatedPond({
  discards,
  riichiTurnIndex,
  rotation,
}: {
  discards: string[];
  riichiTurnIndex?: number;
  rotation: 90 | -90;
}) {
  // Container: swapped dimensions (114w × 168h)
  // Kamicha (90°):  tiles anchor right edge (near wind indicator)
  // Shimocha (-90°): tiles anchor left edge (near wind indicator)
  const translate =
    rotation === 90
      ? `translate(${POND_H}px, 0px)`
      : `translate(0px, ${POND_W}px)`;

  return (
    <div
      style={{
        width: POND_H,
        height: POND_W,
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `${translate} rotate(${rotation}deg)`,
          transformOrigin: "top left",
        }}
      >
        <DiscardPond
          discards={discards}
          size="xs"
          riichiTurnIndex={riichiTurnIndex}
        />
      </div>
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
      {/* Toimen discards (top) — rotated 180° to face toimen */}
      <div
        style={{
          width: POND_W,
          height: POND_H,
          flexShrink: 0,
          transform: "rotate(180deg)",
        }}
      >
        <DiscardPond
          discards={toimen.discards}
          size="xs"
          riichiTurnIndex={toimen.riichiTurnIndex}
        />
      </div>

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
        {/* Kamicha: rotated 90° CW */}
        <RotatedPond
          discards={kamicha.discards}
          riichiTurnIndex={kamicha.riichiTurnIndex}
          rotation={90}
        />

        <WindIndicator roundWind={roundWind} turnNumber={turnNumber} />

        {/* Shimocha: rotated -90° CCW */}
        <RotatedPond
          discards={shimocha.discards}
          riichiTurnIndex={shimocha.riichiTurnIndex}
          rotation={-90}
        />
      </div>

      {/* Your discards (bottom) — fixed 3-row × 6-col area */}
      <div style={{ width: POND_W, height: POND_H, flexShrink: 0 }}>
        <DiscardPond
          discards={you.discards}
          size="xs"
          riichiTurnIndex={you.riichiTurnIndex}
        />
      </div>
    </div>
  );
}
