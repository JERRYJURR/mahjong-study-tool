import { useCallback } from "react";
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  ACCENT_CYAN,
  BORDER_DEFAULT,
  FONT_LABEL,
  FONT_BODY,
  FONT_BODY_LG,
} from "../../lib/designTokens";

export type GenerationStatus =
  | "idle"          // explanations not yet generated
  | "generating"    // in progress
  | "done"          // all generated
  | "error";        // something went wrong

interface GeneratePanelProps {
  status: GenerationStatus;
  progress: number;      // 0-based index of current item being generated
  total: number;         // total mistakes to generate
  error: string | null;
  onGenerate: () => void;
}

export default function GeneratePanel({
  status,
  progress,
  total,
  error,
  onGenerate,
}: GeneratePanelProps) {
  const handleGenerate = useCallback(() => {
    onGenerate();
  }, [onGenerate]);

  // Don't show panel when done
  if (status === "done") return null;

  return (
    <div
      style={{
        padding: "20px 24px",
        borderRadius: 14,
        background: "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(8,145,178,0.03))",
        border: "1px solid rgba(8,145,178,0.18)",
        textAlign: "center",
      }}
    >
      {status === "idle" && (
        <>
          <div style={{ fontSize: FONT_BODY_LG, color: "#a1a1aa", marginBottom: 12, lineHeight: 1.5 }}>
            Mistakes identified. Generate detailed AI explanations for each one.
          </div>
          <button
            onClick={handleGenerate}
            style={{
              padding: "12px 32px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #0e7490, #0891b2)",
              color: "#e0f2fe",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
              boxShadow: "0 2px 12px rgba(8,145,178,0.25)",
              transition: "all 0.15s",
            }}
          >
            Generate AI Analysis
          </button>
          <div style={{ fontSize: FONT_LABEL, color: TEXT_MUTED, marginTop: 10 }}>
            Powered by Claude
          </div>
        </>
      )}

      {status === "generating" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 18,
                height: 18,
                border: `2.5px solid ${BORDER_DEFAULT}`,
                borderTopColor: ACCENT_CYAN,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: FONT_BODY_LG, fontWeight: 600, color: TEXT_PRIMARY }}>
              Generating analysis...
            </span>
          </div>
          <div
            style={{
              maxWidth: 280,
              margin: "0 auto",
              height: 4,
              borderRadius: 2,
              background: BORDER_DEFAULT,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${((progress + 1) / total) * 100}%`,
                height: "100%",
                borderRadius: 2,
                background: `linear-gradient(90deg, #0891b2, ${ACCENT_CYAN})`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ fontSize: FONT_LABEL, color: TEXT_MUTED, marginTop: 8 }}>
            {progress + 1} of {total} mistakes
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: FONT_BODY, color: "#f87171", marginBottom: 10, lineHeight: 1.5 }}>
            {error || "Something went wrong."}
          </div>
          <button
            onClick={handleGenerate}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#0e7490",
              color: "#e0f2fe",
              fontSize: FONT_BODY,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Retry
          </button>
        </>
      )}
    </div>
  );
}
