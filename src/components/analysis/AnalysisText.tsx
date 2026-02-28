import type { Explanation } from "../../data/types";

interface AnalysisTextProps {
  explanation: Explanation;
  isGenerating?: boolean;
}

/** Check if this is a pipeline placeholder (not yet AI-generated) */
function isPlaceholder(explanation: Explanation): boolean {
  return explanation.principle.includes("pending") ||
    explanation.principle.includes("Claude API");
}

export default function AnalysisText({ explanation, isGenerating }: AnalysisTextProps) {
  const placeholder = isPlaceholder(explanation);

  // If it's a placeholder and we're actively generating, show a loading state
  if (placeholder && isGenerating) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 9,
          background: "#0f0f12",
          border: "1px solid #1a1a1d",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            border: "2px solid #1a1a1d",
            borderTopColor: "#22d3ee",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 12, color: "#52525b" }}>
          Generating AI analysis...
        </span>
      </div>
    );
  }

  // If it's a placeholder and NOT generating, show a subtle hint
  if (placeholder) {
    return (
      <div
        style={{
          padding: 14,
          borderRadius: 9,
          background: "#0f0f12",
          border: "1px dashed #1a1a1d",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "#3f3f46" }}>
          AI analysis not yet generated
        </span>
      </div>
    );
  }

  // Real AI-generated explanation
  return (
    <>
      {/* Summary */}
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 9,
          background: "rgba(34,211,238,0.04)",
          border: "1px solid rgba(34,211,238,0.08)",
        }}
      >
        <p style={{ fontSize: 12.5, color: "#d4d4d8", lineHeight: 1.6, margin: 0 }}>
          {explanation.summary}
        </p>
      </div>

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
                  color: "#22d3ee",
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
