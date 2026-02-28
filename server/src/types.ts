/**
 * Server-side types for the mahjong study tool API.
 */

// ── Job Queue ────────────────────────────────────────────────────────

export type JobStatus = "queued" | "fetching" | "analyzing" | "transforming" | "done" | "error";

export interface Job {
  id: string;
  status: JobStatus;
  progress?: string;           // human-readable progress message
  createdAt: number;           // timestamp ms
  updatedAt: number;
  /** Input: what was submitted */
  input: AnalyzeInput;
  /** Output: the pipeline result (only when status === "done") */
  result?: PipelineOutput;
  /** Error message (only when status === "error") */
  error?: string;
}

export type AnalyzeInput =
  | { type: "url"; url: string; player?: number }
  | { type: "paipu"; paipuId: string; player?: number }
  | { type: "files"; mjaiLog: MjaiEventRaw[]; review: MortalReviewRaw };

/** Raw mjai event (untyped — the frontend pipeline will parse these) */
export type MjaiEventRaw = Record<string, unknown>;

/** Raw Mortal review (untyped — the frontend pipeline will parse) */
export type MortalReviewRaw = Record<string, unknown>;

// ── Pipeline Output ──────────────────────────────────────────────────

export interface PipelineOutput {
  /** The mjai event log (NDJSON parsed to array) */
  mjaiLog: MjaiEventRaw[];
  /** The Mortal review JSON */
  review: MortalReviewRaw;
  /** Metadata extracted during analysis */
  meta?: {
    playerName?: string;
    playerSeat?: number;
    gameDate?: string;
  };
}

// ── API Request/Response ─────────────────────────────────────────────

export interface AnalyzeRequest {
  /** Mahjong Soul replay URL or paipu ID */
  url?: string;
  /** Explicit player seat (0-3), auto-detected if omitted */
  player?: number;
}

export interface AnalyzeResponse {
  jobId: string;
}

export interface JobStatusResponse {
  id: string;
  status: JobStatus;
  progress?: string;
  result?: PipelineOutput;
  error?: string;
}

// ── Player Lookup (amae-koromo) ──────────────────────────────────────

export interface PlayerSearchResult {
  id: number;
  nickname: string;
  level: {
    id: number;
    score: number;
    delta: number;
  };
  latest_timestamp: number;
}

export interface GameRecord {
  _id?: string;
  modeId: number;
  uuid: string;           // Mahjong Soul game UUID (replay ID)
  startTime: number;       // unix seconds
  endTime: number;         // unix seconds
  players: GamePlayerRecord[];
}

export interface GamePlayerRecord {
  accountId: number;
  nickname: string;
  level: number;
  score: number;
  gradingScore?: number;
}

// ── Explain (Claude API) ─────────────────────────────────────────────

export interface ExplainRequest {
  mistakes: ExplainMistakeInput[];
}

export interface ExplainMistakeInput {
  /** Serialized mistake data for building Claude prompt */
  round: string;
  turn: number;
  evDiff: number;
  category: string;
  hand: string[];
  drew: string | null;
  yourDiscard: string | null;
  optimalDiscard: string;
  boardState: Record<string, unknown>;
  impact: Record<string, unknown>;
}

export interface ExplainResponse {
  explanations: ExplanationResult[];
}

export interface ExplanationResult {
  summary: string;
  details: string[];
  principle: string;
}
