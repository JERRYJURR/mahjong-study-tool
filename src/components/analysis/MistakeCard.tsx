import type { Mistake } from "../../data/types";
import { evColor, CATEGORY_ICONS } from "../../lib/utils";
import TableBoard from "../board/TableBoard";
import TileRow from "../tiles/TileRow";
import Tile from "../tiles/Tile";
import HandComparison from "./HandComparison";
import ImpactPanel from "./ImpactPanel";
import AnalysisText from "./AnalysisText";
import MistakeChat from "../chat/MistakeChat";

interface MistakeCardProps {
  mistake: Mistake;
  isOpen: boolean;
  onToggle: () => void;
  isGenerating?: boolean;
}

export default function MistakeCard({ mistake, isOpen, onToggle, isGenerating }: MistakeCardProps) {
  const m = mistake;
  const border = isOpen
    ? m.evDiff <= -3
      ? "rgba(239,68,68,0.25)"
      : m.evDiff <= -2
        ? "rgba(251,146,60,0.2)"
        : "rgba(250,204,21,0.15)"
    : "#1a1a1d";

  return (
    <div
      style={{
        border: `1px solid ${border}`,
        borderRadius: 14,
        background: "#0f0f12",
        transition: "all 0.2s",
        overflow: "hidden",
      }}
    >
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "inherit",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "#1a1a1d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {CATEGORY_ICONS[m.category] ?? "\u2753"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#d4d4d8" }}>{m.round}</span>
            <span style={{ fontSize: 10, color: "#3f3f46" }}>T{m.turn}</span>
            <span
              style={{
                fontSize: 9,
                color: "#52525b",
                background: "#1a1a1d",
                padding: "2px 7px",
                borderRadius: 20,
              }}
            >
              {m.category}
            </span>
          </div>
          {!isOpen && (
            <p
              style={{
                fontSize: 11,
                color: "#52525b",
                marginTop: 2,
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {m.explanation.summary}
            </p>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 8 }}>
          <div
            style={{
              fontSize: 19,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono',monospace",
              color: evColor(m.evDiff),
              letterSpacing: "-0.02em",
            }}
          >
            {m.evDiff.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: 8,
              color: "#27272a",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            EV diff
          </div>
        </div>
        <div
          style={{
            color: "#27272a",
            fontSize: 14,
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        >
          ▾
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div
          style={{
            padding: "0 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            borderTop: "1px solid #141416",
          }}
        >
          <div style={{ paddingTop: 12 }}>
            <TableBoard data={m.boardState} />
          </div>

          {/* Your hand */}
          <div>
            <div
              style={{
                fontSize: 9,
                color: "#3f3f46",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 5,
              }}
            >
              Your Hand
            </div>
            <TileRow tiles={m.hand} size="md" />
            {m.drew && (
              <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 10, color: "#27272a" }}>Drew:</span>
                <Tile tile={m.drew} size="md" />
              </div>
            )}
          </div>

          <HandComparison yourDiscard={m.yourDiscard} optimalDiscard={m.optimalDiscard} />
          <ImpactPanel impact={m.impact} />
          <AnalysisText explanation={m.explanation} isGenerating={isGenerating} />
          <MistakeChat mistakeId={m.id} />
        </div>
      )}
    </div>
  );
}
