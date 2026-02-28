import type { TileNotation } from "../../data/types";
import Tile from "../tiles/Tile";
import { TEXT_MUTED, FONT_BODY } from "../../lib/designTokens";

interface HandComparisonProps {
  yourDiscard: TileNotation | null;
  optimalDiscard: string;
}

export default function HandComparison({ yourDiscard, optimalDiscard }: HandComparisonProps) {
  const isSimpleOptimal = optimalDiscard && !optimalDiscard.includes("Chi") && !optimalDiscard.includes("with");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {/* Your play */}
      <div
        style={{
          padding: 10,
          borderRadius: 9,
          background: "rgba(239,68,68,0.04)",
          border: "1px solid rgba(239,68,68,0.1)",
        }}
      >
        <div
          style={{
            fontSize: FONT_BODY,
            color: "#f87171",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          Your Play
        </div>
        {yourDiscard ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Tile tile={yourDiscard} highlight="bad" size="lg" />
            <span style={{ fontSize: FONT_BODY, color: TEXT_MUTED }}>Discard {yourDiscard}</span>
          </div>
        ) : (
          <span style={{ fontSize: FONT_BODY, color: TEXT_MUTED, fontStyle: "italic" }}>Passed on call</span>
        )}
      </div>

      {/* Optimal play */}
      <div
        style={{
          padding: 10,
          borderRadius: 9,
          background: "rgba(52,211,153,0.04)",
          border: "1px solid rgba(52,211,153,0.1)",
        }}
      >
        <div
          style={{
            fontSize: FONT_BODY,
            color: "#34d399",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          Optimal Play
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isSimpleOptimal && <Tile tile={optimalDiscard} highlight="good" size="lg" />}
          <span style={{ fontSize: FONT_BODY, color: TEXT_MUTED }}>{optimalDiscard || "\u2014"}</span>
        </div>
      </div>
    </div>
  );
}
