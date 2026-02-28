import { useState, useRef, useCallback } from "react";
import type { Mistake, ReplayMetadata } from "../../data/types";
import type { PipelineConfig } from "../../data/mortalTypes";
import { DEFAULT_PIPELINE_CONFIG } from "../../data/mortalTypes";
import { MOCK_MJAI_LOG, MOCK_MORTAL_REVIEW } from "../../data/mockMortalData";
import { MOCK_MISTAKES, MOCK_REPLAY } from "../../data/mockData";
import { parseMjaiLog, parseMortalReview, detectFileType } from "../../lib/fileParsers";
import { transformReview } from "../../lib/pipeline";

interface ReplayUploadProps {
  onResult: (mistakes: Mistake[], metadata: ReplayMetadata) => void;
}

type UploadState = "empty" | "files_ready" | "processing" | "error";

interface FileInfo {
  name: string;
  size: number;
  text: string;
  fileType: "mjai" | "review" | "unknown";
}

export default function ReplayUpload({ onResult }: ReplayUploadProps) {
  const [state, setState] = useState<UploadState>("empty");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [error, setError] = useState<string>("");
  const [playerSeat, setPlayerSeat] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const infos: FileInfo[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const text = await file.text();
      const fileType = detectFileType(text);
      infos.push({
        name: file.name,
        size: file.size,
        text,
        fileType,
      });
    }

    setFiles(infos);
    setState("files_ready");
    setError("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles],
  );

  const processFiles = useCallback(() => {
    setState("processing");
    setError("");

    // Small delay to let spinner render
    setTimeout(() => {
      try {
        const mjaiFile = files.find((f) => f.fileType === "mjai");
        const reviewFile = files.find((f) => f.fileType === "review");

        if (!mjaiFile) {
          throw new Error("Could not identify mjai event log file. Make sure one of the files contains mjai events (NDJSON format).");
        }
        if (!reviewFile) {
          throw new Error("Could not identify Mortal review file. Make sure one of the files contains a JSON object with a \"kyokus\" array.");
        }

        const { events, errors: mjaiErrors } = parseMjaiLog(mjaiFile.text);
        if (mjaiErrors.length > 0 && events.length === 0) {
          throw new Error(`mjai parse error: ${mjaiErrors[0].message}`);
        }

        const { review, errors: reviewErrors } = parseMortalReview(reviewFile.text);
        if (!review) {
          throw new Error(`Review parse error: ${reviewErrors[0]?.message ?? "Unknown error"}`);
        }

        const config: PipelineConfig = {
          ...DEFAULT_PIPELINE_CONFIG,
          reviewedPlayer: playerSeat,
        };

        const result = transformReview(review, events, config);

        if (result.mistakes.length === 0) {
          throw new Error("No mistakes found. The AI may have agreed with all plays, or the EV threshold filtered everything out.");
        }

        onResult(result.mistakes, result.metadata);
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Unknown processing error");
      }
    }, 100);
  }, [files, playerSeat, onResult]);

  const loadDemoData = useCallback(() => {
    // Option 1: Use existing mock Mistake[] directly (pre-built)
    onResult(MOCK_MISTAKES, MOCK_REPLAY);
  }, [onResult]);

  const loadDemoPipeline = useCallback(() => {
    setState("processing");
    setTimeout(() => {
      try {
        const config: PipelineConfig = {
          ...DEFAULT_PIPELINE_CONFIG,
          reviewedPlayer: 0,
        };
        const result = transformReview(MOCK_MORTAL_REVIEW, MOCK_MJAI_LOG, config);
        if (result.mistakes.length === 0) {
          // Fallback to pre-built mock data
          onResult(MOCK_MISTAKES, MOCK_REPLAY);
        } else {
          onResult(result.mistakes, result.metadata);
        }
      } catch {
        // Fallback to pre-built mock data
        onResult(MOCK_MISTAKES, MOCK_REPLAY);
      }
    }, 300);
  }, [onResult]);

  const resetUpload = useCallback(() => {
    setState("empty");
    setFiles([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div>
      <p
        style={{
          fontSize: 12,
          color: "#71717a",
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        Upload your mjai event log and Mortal review JSON.
      </p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: "2px dashed #1a1a1d",
          borderRadius: 12,
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: state === "files_ready" ? "rgba(34,211,238,0.03)" : "transparent",
          borderColor: state === "files_ready" ? "#164e63" : "#1a1a1d",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json,.mjson,.jsonl"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />

        {state === "empty" && (
          <>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📁</div>
            <div style={{ fontSize: 13, color: "#71717a", marginBottom: 6 }}>
              Drop files here or click to browse
            </div>
            <div style={{ fontSize: 11, color: "#3f3f46" }}>
              mjai log (.mjson / .json) + Mortal review (.json)
            </div>
          </>
        )}

        {state === "files_ready" && (
          <>
            <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
            {files.map((f, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  color: "#a1a1aa",
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 5px",
                    borderRadius: 4,
                    background: f.fileType === "mjai" ? "#164e63" : f.fileType === "review" ? "#1e1b4b" : "#27272a",
                    color: f.fileType === "mjai" ? "#22d3ee" : f.fileType === "review" ? "#818cf8" : "#71717a",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {f.fileType}
                </span>
                <span>{f.name}</span>
                <span style={{ color: "#3f3f46", fontSize: 10 }}>
                  ({(f.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ))}
          </>
        )}

        {state === "processing" && (
          <>
            <div
              style={{
                width: 24,
                height: 24,
                border: "3px solid #1a1a1d",
                borderTopColor: "#22d3ee",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <div style={{ fontSize: 12, color: "#71717a" }}>
              Parsing replay data...
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>
              {error}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              style={{
                fontSize: 11,
                color: "#a1a1aa",
                background: "#1a1a1d",
                border: "none",
                borderRadius: 6,
                padding: "5px 12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>

      {/* Player seat selector */}
      {state === "files_ready" && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
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

      {/* Process button */}
      {state === "files_ready" && (
        <button
          onClick={processFiles}
          style={{
            marginTop: 16,
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#0e7490",
            color: "#e0f2fe",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Analyze Mistakes
        </button>
      )}

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "28px 0",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "#1a1a1d" }} />
        <span style={{ fontSize: 10, color: "#27272a" }}>OR</span>
        <div style={{ flex: 1, height: 1, background: "#1a1a1d" }} />
      </div>

      {/* Demo data buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={loadDemoData}
          style={{
            flex: 1,
            padding: 11,
            borderRadius: 10,
            border: "1px solid #1a1a1d",
            background: "transparent",
            color: "#52525b",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Load Demo (Mock)
        </button>
        <button
          onClick={loadDemoPipeline}
          style={{
            flex: 1,
            padding: 11,
            borderRadius: 10,
            border: "1px solid #1a1a1d",
            background: "transparent",
            color: "#52525b",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Load Demo (Pipeline)
        </button>
      </div>
    </div>
  );
}
