import type { ReplayMetadata } from "../../data/types";
import { rankEmoji } from "../../lib/utils";
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  ACCENT_CYAN,
  BORDER_SUBTLE,
  BORDER_DEFAULT,
  BG_CARD,
  BG_SURFACE,
  FONT_LABEL,
  FONT_BODY,
  FONT_MONO,
  FONT_SERIF,
} from "../../lib/designTokens";

interface HeaderProps {
  replay: ReplayMetadata;
  totalEvLoss: number;
  onNewReplay?: () => void;
}

export default function Header({ replay, totalEvLoss, onNewReplay }: HeaderProps) {
  const r = replay;
  const hasResult = r.result.rank > 0;
  const accuracy = Number.isFinite(r.overallAccuracy)
    ? r.overallAccuracy.toFixed(1)
    : "—";

  return (
    <div
      style={{
        borderBottom: `1px solid ${BORDER_SUBTLE}`,
        background: "rgba(9,9,11,0.92)",
        backdropFilter: "blur(8px)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "11px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo + title + metadata */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(8,145,178,0.07)",
              border: "1px solid rgba(8,145,178,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: ACCENT_CYAN,
              fontSize: 15,
              fontWeight: 800,
              fontFamily: FONT_SERIF,
            }}
          >
            牌
          </div>
          <div>
            <h1
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: "-0.01em",
              }}
            >
              Replay Study
            </h1>
            <span style={{ fontSize: FONT_LABEL, color: TEXT_MUTED }}>
              {r.date} &middot; {r.room} &middot; {r.mode}
            </span>
          </div>
        </div>

        {/* Center: Stats */}
        <div style={{ display: "flex", gap: 6, fontSize: FONT_LABEL }}>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: BG_CARD,
              border: `1px solid ${BORDER_DEFAULT}`,
            }}
          >
            <span style={{ color: TEXT_MUTED }}>Mistakes </span>
            <span style={{ fontWeight: 600 }}>{r.totalMistakes}</span>
            <span style={{ color: BORDER_DEFAULT, margin: "0 4px" }}>
              &middot;
            </span>
            <span style={{ color: TEXT_MUTED }}>Major </span>
            <span style={{ color: "#f87171", fontWeight: 600 }}>
              {r.bigMistakes}
            </span>
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: BG_CARD,
              border: `1px solid ${BORDER_DEFAULT}`,
            }}
          >
            <span style={{ color: TEXT_MUTED }}>EV lost </span>
            <span
              style={{
                color: "#f87171",
                fontWeight: 700,
                fontFamily: FONT_MONO,
              }}
            >
              {totalEvLoss.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right: Result + Accuracy + New Replay */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: FONT_LABEL,
          }}
        >
          {/* Result — hidden when rank is 0 (missing data) */}
          {hasResult && (
            <>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: TEXT_MUTED }}>Result</div>
                <div style={{ fontWeight: 700, fontSize: FONT_BODY }}>
                  {rankEmoji(r.result.rank)}{" "}
                  {r.result.score.toLocaleString()}{" "}
                  <span
                    style={{
                      color: r.result.delta.startsWith("+")
                        ? "#4ade80"
                        : "#f87171",
                    }}
                  >
                    ({r.result.delta})
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 1,
                  height: 22,
                  background: BORDER_DEFAULT,
                }}
              />
            </>
          )}

          {/* Accuracy */}
          <div style={{ textAlign: "right" }}>
            <div style={{ color: TEXT_MUTED }}>Accuracy</div>
            <div style={{ fontWeight: 700, fontSize: FONT_BODY }}>
              {accuracy}%
            </div>
          </div>

          <div
            style={{ width: 1, height: 22, background: BORDER_DEFAULT }}
          />

          {/* New Replay — far right */}
          {onNewReplay && (
            <button
              onClick={onNewReplay}
              style={{
                fontSize: FONT_LABEL,
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${BORDER_DEFAULT}`,
                background: "transparent",
                color: TEXT_MUTED,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              ← New Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
