import type { Mistake } from "../../data/types";
import type { GenerationStatus } from "../analysis/GeneratePanel";
import { evColor, CATEGORY_ICONS } from "../../lib/utils";
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  TEXT_FAINT,
  ACCENT_CYAN,
  BG_CARD,
  BG_SURFACE,
  BORDER_DEFAULT,
  BORDER_SUBTLE,
  FONT_LABEL,
  FONT_BODY,
  FONT_MONO,
} from "../../lib/designTokens";

interface MistakeSidebarProps {
  mistakes: Mistake[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  totalEvLoss: number;
  genStatus: GenerationStatus;
  genProgress: number;
  genError: string | null;
  onGenerate: () => void;
}

export default function MistakeSidebar({
  mistakes,
  selectedId,
  onSelect,
  totalEvLoss,
  genStatus,
  genProgress,
  genError,
  onGenerate,
}: MistakeSidebarProps) {
  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${BORDER_SUBTLE}`,
        background: BG_CARD,
        overflow: "hidden",
      }}
    >
      {/* Summary stats */}
      <div
        style={{
          padding: "14px 16px 10px",
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
        }}
      >
        <div
          style={{
            fontSize: FONT_LABEL,
            fontWeight: 700,
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Mistakes Found
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: BG_SURFACE,
              border: `1px solid ${BORDER_DEFAULT}`,
              fontSize: FONT_LABEL,
            }}
          >
            <span style={{ color: TEXT_MUTED }}>Count </span>
            <span style={{ fontWeight: 600, color: TEXT_PRIMARY }}>
              {mistakes.length}
            </span>
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: BG_SURFACE,
              border: `1px solid ${BORDER_DEFAULT}`,
              fontSize: FONT_LABEL,
            }}
          >
            <span style={{ color: TEXT_MUTED }}>EV </span>
            <span
              style={{
                fontWeight: 700,
                color: "#f87171",
                fontFamily: FONT_MONO,
              }}
            >
              {totalEvLoss.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Generate button / progress (compact) */}
      {genStatus !== "done" && (
        <div
          style={{
            padding: "10px 16px",
            borderBottom: `1px solid ${BORDER_SUBTLE}`,
          }}
        >
          {genStatus === "idle" && (
            <button
              onClick={onGenerate}
              style={{
                width: "100%",
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #0e7490, #0891b2)",
                color: "#e0f2fe",
                fontSize: FONT_BODY,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(8,145,178,0.2)",
              }}
            >
              Generate AI Analysis
            </button>
          )}
          {genStatus === "generating" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: `2px solid ${BORDER_DEFAULT}`,
                    borderTopColor: ACCENT_CYAN,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: FONT_LABEL,
                    fontWeight: 600,
                    color: TEXT_PRIMARY,
                  }}
                >
                  Generating...
                </span>
              </div>
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: BORDER_DEFAULT,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${((genProgress + 1) / mistakes.length) * 100}%`,
                    height: "100%",
                    borderRadius: 2,
                    background: `linear-gradient(90deg, #0891b2, ${ACCENT_CYAN})`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: FONT_LABEL,
                  color: TEXT_MUTED,
                  marginTop: 4,
                }}
              >
                {genProgress + 1} of {mistakes.length}
              </div>
            </div>
          )}
          {genStatus === "error" && (
            <div>
              <div
                style={{
                  fontSize: FONT_LABEL,
                  color: "#f87171",
                  marginBottom: 6,
                  lineHeight: 1.4,
                }}
              >
                {genError || "Something went wrong."}
              </div>
              <button
                onClick={onGenerate}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0e7490",
                  color: "#e0f2fe",
                  fontSize: FONT_LABEL,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scrollable mistake list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "6px 0",
        }}
      >
        {mistakes.map((m) => {
          const isSelected = m.id === selectedId;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                background: isSelected
                  ? "rgba(34,211,238,0.06)"
                  : "transparent",
                border: "none",
                borderLeft: isSelected
                  ? `3px solid ${ACCENT_CYAN}`
                  : "3px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                color: "inherit",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
            >
              {/* Category icon */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: BORDER_DEFAULT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {CATEGORY_ICONS[m.category] ?? "\u2753"}
              </div>

              {/* Round + category */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: FONT_BODY,
                    fontWeight: 600,
                    color: isSelected ? TEXT_PRIMARY : "#d4d4d8",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.round}{" "}
                  <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>
                    T{m.turn}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: FONT_LABEL,
                    color: TEXT_FAINT,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.category}
                </div>
              </div>

              {/* EV diff */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: FONT_MONO,
                  color: evColor(m.evDiff),
                  flexShrink: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {m.evDiff.toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
