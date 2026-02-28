import type { Mistake } from "../../data/types";
import ImpactPanel from "../analysis/ImpactPanel";
import AnalysisText from "../analysis/AnalysisText";
import MistakeChat from "../chat/MistakeChat";
import {
  TEXT_MUTED,
  BORDER_SUBTLE,
} from "../../lib/designTokens";

interface AnalysisPanelProps {
  mistake: Mistake | null;
  isGenerating?: boolean;
}

export default function AnalysisPanel({ mistake, isGenerating }: AnalysisPanelProps) {
  if (!mistake) {
    return (
      <div
        style={{
          width: 360,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>
            {"\u{1F4CA}"}
          </div>
          <div style={{ fontSize: 13, color: TEXT_MUTED }}>
            Analysis will appear here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 360,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Scrollable analysis content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <ImpactPanel impact={mistake.impact} />
        <AnalysisText
          explanation={mistake.explanation}
          isGenerating={isGenerating}
        />
      </div>

      {/* Chat pinned to bottom */}
      <div
        style={{
          borderTop: `1px solid ${BORDER_SUBTLE}`,
          padding: "8px 12px 12px",
          flexShrink: 0,
        }}
      >
        <MistakeChat mistakeId={mistake.id} />
      </div>
    </div>
  );
}
