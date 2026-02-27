import type { Explanation } from "../../data/types";

interface AnalysisTextProps {
  explanation: Explanation;
}

export default function AnalysisText({ explanation }: AnalysisTextProps) {
  return (
    <>
      {/* Numbered analysis points */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: "#3f3f46",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Analysis
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {explanation.details.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 9 }}>
              <span
                style={{
                  color: "#1f1f23",
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 10,
                  marginTop: 2,
                  flexShrink: 0,
                  width: 12,
                  textAlign: "right",
                }}
              >
                {i + 1}.
              </span>
              <p style={{ color: "#a1a1aa", fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Takeaway principle */}
      <div
        style={{
          padding: 12,
          borderRadius: 9,
          background: "rgba(8,145,178,0.05)",
          border: "1px solid rgba(8,145,178,0.12)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: "#22d3ee",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 5,
          }}
        >
          Takeaway
        </div>
        <p style={{ fontSize: 12.5, color: "rgba(207,250,254,0.7)", lineHeight: 1.6, margin: 0 }}>
          {explanation.principle}
        </p>
      </div>
    </>
  );
}
