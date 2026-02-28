import { useState, useCallback, useEffect } from "react";
import { getStoredApiKey, storeApiKey } from "../../lib/claudeApi";

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
  onGenerate: (apiKey: string) => void;
}

export default function GeneratePanel({
  status,
  progress,
  total,
  error,
  onGenerate,
}: GeneratePanelProps) {
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Save key to localStorage whenever it changes
  useEffect(() => {
    storeApiKey(apiKey);
  }, [apiKey]);

  const handleGenerate = useCallback(() => {
    if (!apiKey.trim()) {
      setShowKeyInput(true);
      return;
    }
    onGenerate(apiKey.trim());
  }, [apiKey, onGenerate]);

  const handleKeySubmit = useCallback(() => {
    if (apiKey.trim()) {
      setShowKeyInput(false);
      onGenerate(apiKey.trim());
    }
  }, [apiKey, onGenerate]);

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
      {status === "idle" && !showKeyInput && (
        <>
          <div style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 12, lineHeight: 1.5 }}>
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
            ✦ Generate AI Analysis
          </button>
          <div style={{ fontSize: 10, color: "#3f3f46", marginTop: 10 }}>
            Uses Claude API{apiKey ? "" : " · API key required"}
          </div>
        </>
      )}

      {showKeyInput && (
        <>
          <div style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 12, lineHeight: 1.5 }}>
            Enter your Anthropic API key to generate explanations.
            <br />
            <span style={{ fontSize: 10, color: "#3f3f46" }}>
              Stored locally in your browser. Never sent anywhere except the Anthropic API.
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleKeySubmit()}
              placeholder="sk-ant-..."
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid #1a1a1d",
                background: "#09090b",
                color: "#e4e4e7",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
              }}
            />
            <button
              onClick={handleKeySubmit}
              disabled={!apiKey.trim()}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "none",
                background: apiKey.trim() ? "#0e7490" : "#1a1a1d",
                color: apiKey.trim() ? "#e0f2fe" : "#3f3f46",
                fontSize: 12,
                fontWeight: 600,
                cursor: apiKey.trim() ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Generate
            </button>
          </div>
          <button
            onClick={() => setShowKeyInput(false)}
            style={{
              marginTop: 8,
              fontSize: 10,
              color: "#3f3f46",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        </>
      )}

      {status === "generating" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 18,
                height: 18,
                border: "2.5px solid #1a1a1d",
                borderTopColor: "#22d3ee",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>
              Generating analysis...
            </span>
          </div>
          {/* Progress bar */}
          <div
            style={{
              maxWidth: 280,
              margin: "0 auto",
              height: 4,
              borderRadius: 2,
              background: "#1a1a1d",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${((progress + 1) / total) * 100}%`,
                height: "100%",
                borderRadius: 2,
                background: "linear-gradient(90deg, #0891b2, #22d3ee)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#52525b", marginTop: 8 }}>
            {progress + 1} of {total} mistakes
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, lineHeight: 1.5 }}>
            {error || "Something went wrong."}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={handleGenerate}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "#0e7490",
                color: "#e0f2fe",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Retry
            </button>
            <button
              onClick={() => setShowKeyInput(true)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #1a1a1d",
                background: "transparent",
                color: "#52525b",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Change API Key
            </button>
          </div>
        </>
      )}
    </div>
  );
}
