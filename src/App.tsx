import { useState, useCallback } from "react";
import type { Mistake, Explanation, ReplayMetadata } from "./data/types";
import Header from "./components/layout/Header";
import MistakeSidebar from "./components/layout/MistakeSidebar";
import BoardPanel from "./components/layout/BoardPanel";
import AnalysisPanel from "./components/layout/AnalysisPanel";
import ReplayInput from "./components/upload/ReplayInput";
import type { GenerationStatus } from "./components/analysis/GeneratePanel";
import { generateAllExplanations } from "./lib/claudeApi";
import { BG_APP, TEXT_PRIMARY, FONT_SANS } from "./lib/designTokens";

type AppMode = "upload" | "results";

export default function App() {
  const [mode, setMode] = useState<AppMode>("upload");
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [metadata, setMetadata] = useState<ReplayMetadata | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // AI generation state
  const [genStatus, setGenStatus] = useState<GenerationStatus>("idle");
  const [genProgress, setGenProgress] = useState(0);
  const [genError, setGenError] = useState<string | null>(null);

  const handleResult = useCallback(
    (newMistakes: Mistake[], newMetadata: ReplayMetadata) => {
      setMistakes(newMistakes);
      setMetadata(newMetadata);
      setSelectedId(newMistakes.length > 0 ? newMistakes[0].id : null);
      setMode("results");
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
    setSelectedId(null);
    setGenStatus("idle");
    setGenProgress(0);
    setGenError(null);
  }, []);

  const handleGenerate = useCallback(
    async () => {
      setGenStatus("generating");
      setGenProgress(0);
      setGenError(null);

      try {
        await generateAllExplanations(
          mistakes,
          { apiKey: "" },
          (index: number, explanation: Explanation) => {
            setGenProgress(index);
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
  const selectedMistake = mistakes.find((m) => m.id === selectedId) ?? null;

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background: BG_APP,
        color: TEXT_PRIMARY,
        fontFamily: FONT_SANS,
        display: "flex",
        flexDirection: "column",
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

          {/* Three-panel layout */}
          <div
            style={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
            }}
          >
            <MistakeSidebar
              mistakes={mistakes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              totalEvLoss={totalEvLoss}
              genStatus={genStatus}
              genProgress={genProgress}
              genError={genError}
              onGenerate={handleGenerate}
            />
            <BoardPanel mistake={selectedMistake} />
            <AnalysisPanel
              mistake={selectedMistake}
              isGenerating={genStatus === "generating"}
            />
          </div>
        </>
      )}
    </div>
  );
}
