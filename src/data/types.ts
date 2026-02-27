export type Suit = "m" | "p" | "s" | "z";

export type TileNotation = string; // e.g. "1m", "5z", "0p"

export type TileSize = "xxs" | "xs" | "sm" | "md" | "lg";

export type HighlightType = "bad" | "good" | null;

export type Wind = "East" | "South" | "West" | "North";

export type MistakeCategory =
  | "Push/Fold"
  | "Efficiency"
  | "Riichi Decision"
  | "Calling Decision"
  | "Defense";

export interface Meld {
  type: "chi" | "pon" | "kan" | "ankan";
  tiles: TileNotation[];
  calledFrom?: number; // index of sideways tile (0-based)
}

export interface PlayerState {
  seat: Wind;
  score: number;
  discards: TileNotation[];
  closedHandCount: number;
  isRiichi: boolean;
  riichiTurnIndex?: number; // which discard is the riichi declaration
  isDealer: boolean;
  openMelds: Meld[];
}

export interface BoardState {
  roundWind: "East" | "South" | "West";
  turnNumber: number;
  dora: TileNotation;
  honba: number;
  you: PlayerState;
  kamicha: PlayerState;
  toimen: PlayerState;
  shimocha: PlayerState;
  round?: string;
}

export interface PointSwing {
  actual: string;
  optimal: string;
  diff: string;
}

export type ImpactType = "dealt_in" | "missed_win" | "position_loss" | "no_direct";

export interface Impact {
  type: ImpactType;
  description: string;
  pointSwing?: PointSwing;
}

export interface Explanation {
  summary: string;
  details: string[]; // 4 numbered analysis points
  principle: string; // takeaway rule
}

export interface Mistake {
  id: number;
  round: string; // "East 2", "South 1 Honba 1"
  turn: number;
  evDiff: number; // negative, e.g. -3.42
  category: MistakeCategory;
  hand: TileNotation[]; // 13 tiles in notation
  drew: TileNotation | null; // tile drawn this turn
  yourDiscard: TileNotation | null;
  optimalDiscard: string; // may include text like "Chi 5m → discard 6z"
  boardState: BoardState;
  impact: Impact;
  explanation: Explanation;
}

export interface ReplayMetadata {
  date: string;
  room: string;
  mode: string;
  result: {
    rank: number;
    score: number;
    delta: string;
  };
  overallAccuracy: number;
  totalMistakes: number;
  bigMistakes: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}
