import type { ReplayMetadata } from "../../data/types";
import { rankEmoji } from "../../lib/utils";

interface HeaderProps {
  replay: ReplayMetadata;
  totalEvLoss: number;
}

export default function Header({ replay, totalEvLoss }: HeaderProps) {
  const r = replay;

  return (
    <>
      {/* Sticky header bar */}
      <div
        style={{
          borderBottom: "1px solid #141416",
          background: "rgba(9,9,11,0.92)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "11px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
                color: "#22d3ee",
                fontSize: 15,
                fontWeight: 800,
                fontFamily: "'Noto Serif',serif",
              }}
            >
              牌
            </div>
            <div>
              <h1 style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", letterSpacing: "-0.01em" }}>
                Replay Study
              </h1>
              <span style={{ fontSize: 10, color: "#3f3f46" }}>
                {r.date} &middot; {r.room} &middot; {r.mode}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#3f3f46" }}>Result</div>
              <div style={{ fontWeight: 700, fontSize: 11 }}>
                {rankEmoji(r.result.rank)} {r.result.score.toLocaleString()}{" "}
                <span style={{ color: r.result.delta.startsWith("+") ? "#4ade80" : "#f87171" }}>
                  ({r.result.delta})
                </span>
              </div>
            </div>
            <div style={{ width: 1, height: 22, background: "#1a1a1d" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#3f3f46" }}>Accuracy</div>
              <div style={{ fontWeight: 700, fontSize: 11 }}>{r.overallAccuracy}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "12px 20px 4px" }}>
        <div style={{ display: "flex", gap: 6, fontSize: 11 }}>
          <div style={{ padding: "4px 10px", borderRadius: 6, background: "#0f0f12", border: "1px solid #1a1a1d" }}>
            <span style={{ color: "#3f3f46" }}>Mistakes </span>
            <span style={{ fontWeight: 600 }}>{r.totalMistakes}</span>
            <span style={{ color: "#1a1a1d", margin: "0 4px" }}>&middot;</span>
            <span style={{ color: "#3f3f46" }}>Major </span>
            <span style={{ color: "#f87171", fontWeight: 600 }}>{r.bigMistakes}</span>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 6, background: "#0f0f12", border: "1px solid #1a1a1d" }}>
            <span style={{ color: "#3f3f46" }}>EV lost </span>
            <span style={{ color: "#f87171", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
              {totalEvLoss.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
