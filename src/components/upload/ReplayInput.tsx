import { useState, useCallback, useRef, useEffect } from "react";
import type { Mistake, ReplayMetadata } from "../../data/types";
import type { MortalReview, MjaiEvent, PipelineConfig } from "../../data/mortalTypes";
import { DEFAULT_PIPELINE_CONFIG } from "../../data/mortalTypes";
import { parseMjaiLog, parseMortalReview } from "../../lib/fileParsers";
import { transformReview } from "../../lib/pipeline";
import ReplayUpload from "./ReplayUpload";
import PlayerLookup from "./PlayerLookup";

type Tab = "url" | "player" | "upload";

/** Detected input type based on what the user pastes */
type InputKind = "majsoul" | "report" | "unknown";

/** Job polling status */
type JobState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "polling"; jobId: string; status: string; progress?: string }
  | { phase: "processing"; progress: string }
  | { phase: "done" }
  | { phase: "error"; message: string; submitUrl?: string };

interface ReplayInputProps {
  onResult: (mistakes: Mistake[], metadata: ReplayMetadata) => void;
}

const POLL_INTERVAL_MS = 2000;

export default function ReplayInput({ onResult }: ReplayInputProps) {
  const [activeTab, setActiveTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [jobState, setJobState] = useState<JobState>({ phase: "idle" });
  const [playerSeat, setPlayerSeat] = useState<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const inputKind = detectInputKind(url.trim());

  // ── Submit handler: smart routing ──

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const kind = detectInputKind(trimmed);

    if (kind === "report") {
      // User pasted a report URL — submit directly
      submitReportUrl(trimmed);
    } else if (kind === "majsoul") {
      // Mahjong Soul URL — extract paipu ID and show two-step flow
      submitMajsoulUrl(trimmed);
    } else {
      setJobState({
        phase: "error",
        message: "Could not recognize this URL. Paste a Mahjong Soul replay URL or an mjai.ekyu.moe report URL.",
      });
    }
  }, [url, playerSeat]);

  const handleReportUrlSubmit = useCallback(() => {
    const trimmed = reportUrl.trim();
    if (!trimmed) return;
    submitReportUrl(trimmed);
  }, [reportUrl, playerSeat]);

  // ── Submit functions ──

  function submitReportUrl(reportUrlValue: string) {
    setJobState({ phase: "submitting" });

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportUrl: reportUrlValue, player: playerSeat }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setJobState({ phase: "error", message: data.error });
          return;
        }
        startPolling(data.jobId);
      })
      .catch((err) => {
        setJobState({
          phase: "error",
          message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
        });
      });
  }

  function submitMajsoulUrl(majsoulUrl: string) {
    setJobState({ phase: "submitting" });

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: majsoulUrl, player: playerSeat }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setJobState({ phase: "error", message: data.error });
          return;
        }
        startPolling(data.jobId);
      })
      .catch((err) => {
        setJobState({
          phase: "error",
          message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
        });
      });
  }

  // ── Job polling ──

  function startPolling(jobId: string) {
    setJobState({ phase: "polling", jobId, status: "queued", progress: "Starting..." });

    // Clear any existing poll
    if (pollRef.current) clearInterval(pollRef.current);

    const poll = () => {
      fetch(`/api/jobs/${jobId}`)
        .then((res) => res.json())
        .then((job) => {
          if (job.error && job.status === "error") {
            if (pollRef.current) clearInterval(pollRef.current);

            // Extract submit URL from error message if present
            const paipuMatch = job.error.match(/Paipu ID: (\S+)/);
            const submitUrl = paipuMatch
              ? `https://mjai.ekyu.moe/?q=${encodeURIComponent(paipuMatch[1])}`
              : undefined;

            setJobState({ phase: "error", message: job.error, submitUrl });
            return;
          }

          if (job.status === "done" && job.result) {
            if (pollRef.current) clearInterval(pollRef.current);

            setJobState({ phase: "processing", progress: "Running analysis pipeline..." });

            // Run the frontend pipeline on the returned data
            setTimeout(() => {
              try {
                processResult(job.result);
              } catch (err) {
                setJobState({
                  phase: "error",
                  message: `Pipeline error: ${err instanceof Error ? err.message : String(err)}`,
                });
              }
            }, 100);
            return;
          }

          // Still in progress
          setJobState({
            phase: "polling",
            jobId,
            status: job.status,
            progress: job.progress,
          });
        })
        .catch(() => {
          // Network error during poll — keep trying
        });
    };

    // First poll immediately
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }

  // ── Process the server result through the frontend pipeline ──

  function processResult(result: { review: Record<string, unknown>; mjaiLog: Record<string, unknown>[]; meta?: Record<string, unknown> }) {
    // Parse the review data
    const reviewText = JSON.stringify(result.review);
    const { review, errors: reviewErrors } = parseMortalReview(reviewText);

    if (!review) {
      throw new Error(
        `Could not parse review data: ${reviewErrors[0]?.message ?? "Unknown format"}. ` +
        `The report may use an unsupported format. Try uploading the files manually via the "Upload Files" tab.`,
      );
    }

    // Parse the mjai log
    let mjaiEvents: MjaiEvent[] = [];

    if (result.mjaiLog && result.mjaiLog.length > 0) {
      // The log is already parsed as objects — convert through JSON for type safety
      const logText = result.mjaiLog.map((e) => JSON.stringify(e)).join("\n");
      const { events } = parseMjaiLog(logText);
      mjaiEvents = events;
    }

    // Determine player seat
    const seat = result.meta?.playerSeat as number | undefined;

    const config: PipelineConfig = {
      ...DEFAULT_PIPELINE_CONFIG,
      reviewedPlayer: seat ?? playerSeat,
    };

    const pipelineResult = transformReview(review, mjaiEvents, config);

    if (pipelineResult.mistakes.length === 0) {
      throw new Error(
        "No mistakes found. The AI may have agreed with all plays, " +
        "or the EV threshold filtered everything out.",
      );
    }

    setJobState({ phase: "done" });
    onResult(pipelineResult.mistakes, pipelineResult.metadata);
  }

  // ── Reset ──

  const handleReset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setJobState({ phase: "idle" });
    setReportUrl("");
  }, []);

  const handleGameSelect = useCallback((uuid: string) => {
    setActiveTab("url");
    setUrl(`https://game.mahjongsoul.com/?paipu=${uuid}`);
    setJobState({ phase: "idle" });
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "url", label: "Replay URL" },
    { key: "player", label: "Player Lookup" },
    { key: "upload", label: "Upload Files" },
  ];

  const isWorking = jobState.phase === "submitting" || jobState.phase === "polling" || jobState.phase === "processing";

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
          Mahjong Study Tool
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
              handleReset();
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
            Paste a Mahjong Soul replay URL or mjai.ekyu.moe report URL.
          </p>

          {/* Main URL input */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (jobState.phase === "error") setJobState({ phase: "idle" });
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="https://game.mahjongsoul.com/?paipu=... or mjai.ekyu.moe report URL"
              disabled={isWorking}
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
                opacity: isWorking ? 0.5 : 1,
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!url.trim() || isWorking}
              style={{
                padding: "11px 20px",
                borderRadius: 9,
                border: "none",
                background: url.trim() && !isWorking
                  ? "linear-gradient(135deg, #0e7490, #0891b2)"
                  : "#1a1a1d",
                color: url.trim() && !isWorking ? "#e0f2fe" : "#3f3f46",
                fontSize: 13,
                fontWeight: 700,
                cursor: url.trim() && !isWorking ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                boxShadow: url.trim() && !isWorking ? "0 2px 8px rgba(8,145,178,0.2)" : "none",
              }}
            >
              {isWorking ? "..." : "Analyze"}
            </button>
          </div>

          {/* Input type hint */}
          {url.trim() && jobState.phase === "idle" && (
            <div style={{ marginTop: 8, fontSize: 11, color: "#3f3f46" }}>
              {inputKind === "report" && "Detected: mjai.ekyu.moe report URL"}
              {inputKind === "majsoul" && "Detected: Mahjong Soul replay URL"}
            </div>
          )}

          {/* Player seat selector */}
          {url.trim() && (jobState.phase === "idle" || jobState.phase === "error") && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 11, color: "#71717a" }}>Your seat:</label>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2, 3].map((seat) => (
                  <button
                    key={seat}
                    onClick={() => setPlayerSeat(seat)}
                    style={{
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 6,
                      border: `1px solid ${seat === playerSeat ? "#164e63" : "#1a1a1d"}`,
                      background: seat === playerSeat ? "#0c4a6e" : "transparent",
                      color: seat === playerSeat ? "#22d3ee" : "#52525b",
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Polling / progress status */}
          {(jobState.phase === "polling" || jobState.phase === "processing" || jobState.phase === "submitting") && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 10,
                background: "rgba(34,211,238,0.04)",
                border: "1px solid rgba(34,211,238,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #1a1a1d",
                  borderTopColor: "#22d3ee",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 12, color: "#a1a1aa" }}>
                  {jobState.phase === "submitting" && "Submitting..."}
                  {jobState.phase === "polling" && (jobState.progress ?? `Status: ${jobState.status}`)}
                  {jobState.phase === "processing" && jobState.progress}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {jobState.phase === "error" && (
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
                {jobState.message}
              </pre>

              {/* Show mjai.ekyu.moe link if we have a submit URL */}
              {jobState.submitUrl && (
                <a
                  href={jobState.submitUrl}
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
                  Open mjai.ekyu.moe (pre-filled)
                </a>
              )}

              {/* Report URL input for step 2 */}
              {jobState.submitUrl && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 11, color: "#71717a", marginBottom: 8 }}>
                    After analyzing on mjai.ekyu.moe, paste the report URL here:
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={reportUrl}
                      onChange={(e) => setReportUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReportUrlSubmit()}
                      placeholder="https://mjai.ekyu.moe/report/..."
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: 7,
                        border: "1px solid #1a1a1d",
                        background: "#09090b",
                        color: "#e4e4e7",
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', monospace",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleReportUrlSubmit}
                      disabled={!reportUrl.trim()}
                      style={{
                        padding: "9px 16px",
                        borderRadius: 7,
                        border: "none",
                        background: reportUrl.trim()
                          ? "#0e7490"
                          : "#1a1a1d",
                        color: reportUrl.trim() ? "#e0f2fe" : "#3f3f46",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: reportUrl.trim() ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Fetch Report
                    </button>
                  </div>
                </div>
              )}

              {/* Reset button */}
              <button
                onClick={handleReset}
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: "#71717a",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Start over
              </button>
            </div>
          )}

          {/* How it works */}
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
              1. Paste a Mahjong Soul replay URL<br />
              2. Open mjai.ekyu.moe, solve the CAPTCHA, and submit<br />
              3. Copy the report URL back here<br />
              4. View your analyzed mistakes with Claude AI explanations
            </div>
            <div style={{ fontSize: 10, color: "#3f3f46", marginTop: 8, lineHeight: 1.5 }}>
              Tip: You can also paste an mjai.ekyu.moe report URL directly to skip steps 1-2.
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

function detectInputKind(input: string): InputKind {
  if (!input) return "unknown";

  // Check for mjai.ekyu.moe report URL
  try {
    const url = new URL(input);
    if (
      (url.hostname === "mjai.ekyu.moe" || url.hostname === "www.mjai.ekyu.moe") &&
      url.pathname.startsWith("/report/")
    ) {
      return "report";
    }
  } catch {
    // Not a URL
  }

  // Check for Mahjong Soul URL
  try {
    const url = new URL(input);
    if (
      url.hostname.includes("mahjongsoul") ||
      url.hostname.includes("maj-soul") ||
      url.searchParams.has("paipu")
    ) {
      return "majsoul";
    }
  } catch {
    // Not a URL
  }

  // Check for paipu ID pattern (6 digits followed by dash and hex)
  if (/^\d{6}-[a-f0-9-]+/.test(input)) {
    return "majsoul";
  }

  // Alphanumeric with dashes could be either
  if (/^[a-zA-Z0-9-]+$/.test(input) && input.length > 10) {
    return "majsoul";
  }

  return "unknown";
}
