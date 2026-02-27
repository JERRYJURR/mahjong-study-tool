import type { Impact, ImpactType } from "../../data/types";

interface ImpactPanelProps {
  impact: Impact;
}

const IMPACT_STYLES: Record<ImpactType, { bg: string; border: string; icon: string }> = {
  dealt_in: { bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.18)", icon: "\u{1F4A5}" },
  missed_win: { bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.18)", icon: "\u{1F624}" },
  position_loss: { bg: "rgba(251,146,60,0.06)", border: "rgba(251,146,60,0.18)", icon: "\u{1F4C9}" },
  no_direct: { bg: "rgba(161,161,170,0.04)", border: "rgba(161,161,170,0.1)", icon: "\u2197\uFE0F" },
};

export default function ImpactPanel({ impact }: ImpactPanelProps) {
  const c = IMPACT_STYLES[impact.type] ?? IMPACT_STYLES.no_direct;

  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{c.icon}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#d4d4d8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          What Actually Happened
        </span>
      </div>
      <p style={{ fontSize: 13, color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
        {impact.description}
      </p>
      {impact.pointSwing && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            {
              label: "Actual",
              value: impact.pointSwing.actual,
              color: impact.pointSwing.actual.startsWith("-") ? "#f87171" : "#4ade80",
            },
            { label: "If Optimal", value: impact.pointSwing.optimal, color: "#4ade80" },
            { label: "\u0394", value: impact.pointSwing.diff, color: "#fbbf24" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "#0a0a0c",
                borderRadius: 6,
                padding: "5px 12px",
                border: "1px solid #1a1a1d",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: "#3f3f46",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: item.color,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
