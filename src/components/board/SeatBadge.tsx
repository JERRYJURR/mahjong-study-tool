import type { Wind } from "../../data/types";

interface SeatBadgeProps {
  label: string;
  seat: Wind;
  score: number;
  isRiichi: boolean;
  isDealer: boolean;
  isYou?: boolean;
  compact?: boolean;
}

export default function SeatBadge({
  label,
  seat,
  score,
  isRiichi,
  isDealer,
  isYou,
  compact,
}: SeatBadgeProps) {
  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: isYou ? "#22d3ee" : isRiichi ? "#f87171" : "#52525b",
          }}
        >
          {label}
        </span>
        {isDealer && <span style={{ fontSize: 7, color: "#fbbf24" }}>親</span>}
        {isRiichi && <span style={{ fontSize: 7, color: "#f87171" }}>⚡</span>}
        <span
          style={{
            fontSize: 7,
            color: "#3f3f46",
            fontFamily: "'JetBrains Mono',monospace",
          }}
        >
          {(score ?? 0).toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: isYou ? "#22d3ee" : isRiichi ? "#f87171" : "#71717a",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 9, color: "#3f3f46" }}>{seat}</span>
      {isDealer && (
        <span
          style={{
            fontSize: 8,
            color: "#fbbf24",
            background: "#292524",
            padding: "1px 4px",
            borderRadius: 3,
          }}
        >
          親
        </span>
      )}
      {isRiichi && (
        <span
          style={{
            fontSize: 8,
            color: "#f87171",
            background: "#1c1017",
            padding: "1px 4px",
            borderRadius: 3,
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          ⚡立直
        </span>
      )}
      <span
        style={{
          fontSize: 9,
          color: "#52525b",
          fontFamily: "'JetBrains Mono',monospace",
        }}
      >
        {(score ?? 0).toLocaleString()}
      </span>
    </div>
  );
}
