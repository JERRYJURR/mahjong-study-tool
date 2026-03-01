import type { Explanation } from "../../data/types";
import { humanizeTiles } from "../../lib/utils";
import {
  TEXT_MUTED,
  TEXT_FAINT,
  ACCENT_CYAN,
  BORDER_DEFAULT,
  BG_CARD,
  FONT_LABEL,
  FONT_BODY,
  FONT_MONO,
} from "../../lib/designTokens";

interface AnalysisTextProps {
  explanation: Explanation;
  isGenerating?: boolean;
  onGenerate?: () => void;
}

/** Check if this is a pipeline placeholder (not yet AI-generated) */
function isPlaceholder(explanation: Explanation): boolean {
  return explanation.principle.includes("pending") ||
    explanation.principle.includes("Claude API");
}

export default function AnalysisText({ explanation, isGenerating, onGenerate }: AnalysisTextProps) {
  const placeholder = isPlaceholder(explanation);

  if (placeholder && isGenerating) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 9,
          background: BG_CARD,
          border: `1px solid ${BORDER_DEFAULT}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
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
        <span style={{ fontSize: FONT_BODY, color: TEXT_MUTED }}>
          Generating AI analysis...
        </span>
      </div>
    );
  }

  if (placeholder) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 9,
          background: BG_CARD,
          border: `1px dashed ${BORDER_DEFAULT}`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>
          {"\u{1F9E0}"}
        </div>
        <div style={{ fontSize: FONT_BODY, color: TEXT_MUTED, marginBottom: 8 }}>
          AI analysis not yet generated
        </div>
        {onGenerate && (
          <button
            onClick={onGenerate}
            style={{
              padding: "8px 20px",
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
      </div>
    );
  }

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
          {humanizeTiles(explanation.summary)}
        </p>
      </div>

      {/* Numbered analysis points */}
      <div>
        <div
          style={{
            fontSize: FONT_LABEL,
            color: TEXT_MUTED,
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
                  color: ACCENT_CYAN,
                  fontFamily: FONT_MONO,
                  fontSize: FONT_LABEL,
                  marginTop: 2,
                  flexShrink: 0,
                  width: 12,
                  textAlign: "right",
                }}
              >
                {i + 1}.
              </span>
              <p style={{ color: "#a1a1aa", fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{humanizeTiles(d)}</p>
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
            fontSize: FONT_LABEL,
            color: ACCENT_CYAN,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 5,
          }}
        >
          Takeaway
        </div>
        <p style={{ fontSize: 12.5, color: "rgba(207,250,254,0.7)", lineHeight: 1.6, margin: 0 }}>
          {humanizeTiles(explanation.principle)}
        </p>
      </div>
    </>
  );
}
