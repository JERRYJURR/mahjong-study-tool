import { useState, useCallback, useEffect } from "react";
import type { Mistake, Explanation, ReplayMetadata } from "./data/types";
import Header from "./components/layout/Header";
import BoardPanel from "./components/layout/BoardPanel";
import AnalysisPanel from "./components/layout/AnalysisPanel";
import InsightNavBar from "./components/layout/InsightNavBar";
import ReplayInput from "./components/upload/ReplayInput";
import TileRow from "./components/tiles/TileRow";
import Tile from "./components/tiles/Tile";
import type { GenerationStatus } from "./components/analysis/GeneratePanel";
import { generateAllExplanations } from "./lib/claudeApi";
import {
  BG_APP,
  TEXT_PRIMARY,
  TEXT_MUTED,
  BORDER_SUBTLE,
  FONT_SANS,
  FONT_LABEL,
} from "./lib/designTokens";
import { MOCK_MISTAKES, MOCK_REPLAY } from "./data/mockData";

type AppMode = "upload" | "results";

const DEBUG_MOCK = true;

export default function App() {
  const [mode, setMode] = useState<AppMode>(DEBUG_MOCK ? "results" : "upload");
  const [mistakes, setMistakes] = useState<Mistake[]>(DEBUG_MOCK ? MOCK_MISTAKES : []);
  const [metadata, setMetadata] = useState<ReplayMetadata | null>(DEBUG_MOCK ? MOCK_REPLAY : null);
  const [selectedId, setSelectedId] = useState<number | null>(DEBUG_MOCK ? MOCK_MISTAKES[0]?.id ?? null : null);

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
  const selectedIndex = mistakes.findIndex((m) => m.id === selectedId);

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedId(mistakes[selectedIndex - 1].id);
    }
  }, [selectedIndex, mistakes]);

  const handleNext = useCallback(() => {
    if (selectedIndex < mistakes.length - 1) {
      setSelectedId(mistakes[selectedIndex + 1].id);
    }
  }, [selectedIndex, mistakes]);

  // Keyboard navigation: left/right arrows
  useEffect(() => {
    if (mode !== "results") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, handlePrev, handleNext]);

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

          {/* Two-panel layout: Board (left col) + Analysis (right col) */}
          <div
            style={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
            }}
          >
            {/* Left column: board + hand bar */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <BoardPanel key={selectedId ?? "empty"} mistake={selectedMistake} />

              {/* Hand bar — anchored to left column only */}
              {selectedMistake && (
                <div
                  style={{
                    height: 70,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    gap: 16,
                    borderTop: `1px solid ${BORDER_SUBTLE}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: FONT_LABEL,
                      color: TEXT_MUTED,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      flexShrink: 0,
                    }}
                  >
                    Your Hand
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <TileRow tiles={selectedMistake.hand} size="md" />
                    {selectedMistake.drew && (
                      <div style={{ marginLeft: 12 }}>
                        <Tile tile={selectedMistake.drew} size="md" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <AnalysisPanel
              key={`analysis-${selectedId ?? "empty"}`}
              mistake={selectedMistake}
              isGenerating={genStatus === "generating"}
              onGenerate={handleGenerate}
            />
          </div>

          {/* Bottom nav bar */}
          <InsightNavBar
            mistakes={mistakes}
            selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
            onPrev={handlePrev}
            onNext={handleNext}
            onSelect={(id) => setSelectedId(id)}
            genStatus={genStatus}
            genProgress={genProgress}
            genError={genError}
            onGenerate={handleGenerate}
          />
        </>
      )}
    </div>
  );
}
