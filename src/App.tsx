import { useState, useCallback } from "react";
import type { Mistake, Explanation, ReplayMetadata } from "./data/types";
import Header from "./components/layout/Header";
import MistakeCard from "./components/analysis/MistakeCard";
import ReplayInput from "./components/upload/ReplayInput";
import GeneratePanel from "./components/analysis/GeneratePanel";
import type { GenerationStatus } from "./components/analysis/GeneratePanel";
import { generateAllExplanations } from "./lib/claudeApi";

type AppMode = "upload" | "results";

export default function App() {
  const [mode, setMode] = useState<AppMode>("upload");
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [metadata, setMetadata] = useState<ReplayMetadata | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  // AI generation state
  const [genStatus, setGenStatus] = useState<GenerationStatus>("idle");
  const [genProgress, setGenProgress] = useState(0);
  const [genError, setGenError] = useState<string | null>(null);

  const handleResult = useCallback(
    (newMistakes: Mistake[], newMetadata: ReplayMetadata) => {
      setMistakes(newMistakes);
      setMetadata(newMetadata);
      setOpenId(newMistakes.length > 0 ? newMistakes[0].id : null);
      setMode("results");
      // Reset generation state for new data
      setGenStatus("idle");
      setGenProgress(0);
      setGenError(null);
    },
    [],
  );

  const handleNewReplay = useCallback(() => {
    setMode("upload");
    setMistakes([]);
    setMetadata(null);
    setOpenId(null);
    setGenStatus("idle");
    setGenProgress(0);
    setGenError(null);
  }, []);

  const handleGenerate = useCallback(
    async (apiKey: string) => {
      setGenStatus("generating");
      setGenProgress(0);
      setGenError(null);

      try {
        await generateAllExplanations(
          mistakes,
          { apiKey },
          (index: number, explanation: Explanation) => {
            setGenProgress(index);
            // Update the specific mistake's explanation immutably
            setMistakes((prev) =>
              prev.map((m, i) =>
                i === index ? { ...m, explanation } : m,
              ),
            );
          },
        );
        setGenStatus("done");
      } catch (err) {
        setGenStatus("error");
        setGenError(
          err instanceof Error ? err.message : "Unknown error occurred",
        );
      }
    },
    [mistakes],
  );

  const totalEvLoss = mistakes.reduce((s, m) => s + m.evDiff, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "#e4e4e7",
        fontFamily: "'DM Sans',-apple-system,sans-serif",
      }}
    >
      {mode === "upload" && <ReplayInput onResult={handleResult} />}

      {mode === "results" && metadata && (
        <>
          <Header
            replay={metadata}
            totalEvLoss={totalEvLoss}
            onNewReplay={handleNewReplay}
          />

          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              padding: "8px 20px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* Generate AI Analysis CTA */}
            <GeneratePanel
              status={genStatus}
              progress={genProgress}
              total={mistakes.length}
              error={genError}
              onGenerate={handleGenerate}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#27272a",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Top {mistakes.length} Biggest Mistakes
              </span>
              <span style={{ fontSize: 9, color: "#1f1f23" }}>By EV impact</span>
            </div>

            {mistakes.map((m) => (
              <MistakeCard
                key={m.id}
                mistake={m}
                isOpen={openId === m.id}
                onToggle={() => setOpenId(openId === m.id ? null : m.id)}
                isGenerating={genStatus === "generating"}
              />
            ))}
          </div>

          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              padding: "0 20px 40px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 10, color: "#141416" }}>
              Mortal AI &middot; Claude &middot; v0.5
            </p>
          </div>
        </>
      )}
    </div>
  );
}
