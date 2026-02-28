import { useState, useCallback } from "react";
import type { Mistake, ReplayMetadata } from "../../data/types";
import ReplayUpload from "./ReplayUpload";
import PlayerLookup from "./PlayerLookup";

type Tab = "url" | "player" | "upload";

interface ReplayInputProps {
  onResult: (mistakes: Mistake[], metadata: ReplayMetadata) => void;
}

export default function ReplayInput({ onResult }: ReplayInputProps) {
  const [activeTab, setActiveTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = useCallback(() => {
    if (!url.trim()) return;
    setSubmitting(true);
    setError(null);

    // Extract paipu ID from URL
    const paipuId = extractPaipuId(url.trim());

    if (!paipuId) {
      setError("Could not parse a valid replay ID from the input.");
      setSubmitting(false);
      return;
    }

    // For now, since automatic fetching isn't configured,
    // show a helpful message with the mjai.ekyu.moe link
    setError(
      `Automatic analysis coming soon! For now:\n\n` +
      `1. Go to mjai.ekyu.moe and analyze your replay\n` +
      `2. Copy the JSON output\n` +
      `3. Use the "Upload Files" tab to upload it\n\n` +
      `Your Paipu ID: ${paipuId}`,
    );
    setSubmitting(false);
  }, [url]);

  const handleGameSelect = useCallback((uuid: string) => {
    setActiveTab("url");
    setUrl(`https://game.mahjongsoul.com/?paipu=${uuid}`);
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "url", label: "Replay URL" },
    { key: "player", label: "Player Lookup" },
    { key: "upload", label: "Upload Files" },
  ];

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "40px 20px 60px",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#e4e4e7",
            marginBottom: 6,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          🀄 Mahjong Study Tool
        </h1>
        <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.5 }}>
          Analyze your Mahjong Soul games with Mortal AI
        </p>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 20,
          background: "#0f0f12",
          borderRadius: 10,
          padding: 3,
          border: "1px solid #1a1a1d",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 8,
              border: "none",
              background: activeTab === tab.key ? "#1a1a1d" : "transparent",
              color: activeTab === tab.key ? "#e4e4e7" : "#52525b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "url" && (
        <div>
          <p style={{ fontSize: 12, color: "#71717a", marginBottom: 14, lineHeight: 1.5 }}>
            Paste a Mahjong Soul replay URL or paipu code.
          </p>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              placeholder="https://game.mahjongsoul.com/?paipu=... or paipu ID"
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: 9,
                border: "1px solid #1a1a1d",
                background: "#09090b",
                color: "#e4e4e7",
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
              }}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!url.trim() || submitting}
              style={{
                padding: "11px 20px",
                borderRadius: 9,
                border: "none",
                background: url.trim() && !submitting
                  ? "linear-gradient(135deg, #0e7490, #0891b2)"
                  : "#1a1a1d",
                color: url.trim() && !submitting ? "#e0f2fe" : "#3f3f46",
                fontSize: 13,
                fontWeight: 700,
                cursor: url.trim() && !submitting ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                boxShadow: url.trim() ? "0 2px 8px rgba(8,145,178,0.2)" : "none",
              }}
            >
              {submitting ? "..." : "Analyze"}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 10,
                background: "rgba(251,146,60,0.06)",
                border: "1px solid rgba(251,146,60,0.15)",
              }}
            >
              <pre
                style={{
                  fontSize: 12,
                  color: "#a1a1aa",
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {error}
              </pre>
              {url.trim() && (
                <a
                  href={`https://mjai.ekyu.moe`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 12,
                    padding: "8px 16px",
                    borderRadius: 7,
                    background: "#0e7490",
                    color: "#e0f2fe",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Open mjai.ekyu.moe →
                </a>
              )}
            </div>
          )}

          {/* Quick info */}
          <div
            style={{
              marginTop: 20,
              padding: "12px 14px",
              borderRadius: 9,
              background: "#0f0f12",
              border: "1px solid #141416",
            }}
          >
            <div style={{ fontSize: 10, color: "#3f3f46", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              How it works
            </div>
            <div style={{ fontSize: 11, color: "#52525b", lineHeight: 1.7 }}>
              1. Play a ranked game on Mahjong Soul<br />
              2. Get your replay analyzed by Mortal AI<br />
              3. Upload the analysis JSON here<br />
              4. Generate Claude AI explanations for your biggest mistakes
            </div>
          </div>
        </div>
      )}

      {activeTab === "player" && (
        <PlayerLookup onGameSelect={handleGameSelect} />
      )}

      {activeTab === "upload" && (
        <ReplayUpload onResult={onResult} />
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function extractPaipuId(input: string): string | null {
  const trimmed = input.trim();

  // Try to parse as URL
  try {
    const url = new URL(trimmed);
    const paipu = url.searchParams.get("paipu");
    if (paipu) return paipu.split("_a")[0];
  } catch {
    // Not a URL
  }

  // Check if it looks like a paipu ID (starts with 6 digits, has dashes)
  if (/^\d{6}-[a-f0-9-]+/.test(trimmed)) {
    return trimmed.split("_a")[0];
  }

  // If it contains alphanum + dashes, might be a valid ID
  if (/^[a-zA-Z0-9-]+$/.test(trimmed) && trimmed.length > 10) {
    return trimmed;
  }

  return null;
}
