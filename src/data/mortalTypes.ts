/**
 * TypeScript interfaces for Mortal AI review data and mjai event log.
 * These represent the INPUT format before transformation to Mistake[].
 */

// ── mjai Event Types ──

export interface MjaiStartKyoku {
  type: "start_kyoku";
  bakaze: string;        // "E" or "S" or "W"
  kyoku: number;         // 1-4 (round within wind)
  honba: number;
  kyotaku: number;       // riichi sticks on table
  oya: number;           // dealer seat index (0-3)
  dora_marker: string;   // dora indicator tile
  tehais: string[][];    // 4 arrays of 13 tiles each ("?" for hidden)
}

export interface MjaiTsumo {
  type: "tsumo";
  actor: number;
  pai: string;
}

export interface MjaiDahai {
  type: "dahai";
  actor: number;
  pai: string;
  tsumogiri: boolean;
}

export interface MjaiChi {
  type: "chi";
  actor: number;
  target: number;
  pai: string;           // called tile
  consumed: string[];    // 2 tiles from hand
}

export interface MjaiPon {
  type: "pon";
  actor: number;
  target: number;
  pai: string;
  consumed: string[];
}

export interface MjaiDaiminkan {
  type: "daiminkan";
  actor: number;
  target: number;
  pai: string;
  consumed: string[];
}

export interface MjaiKakan {
  type: "kakan";
  actor: number;
  pai: string;
  consumed: string[];
}

export interface MjaiAnkan {
  type: "ankan";
  actor: number;
  consumed: string[];
}

export interface MjaiReach {
  type: "reach";
  actor: number;
}

export interface MjaiReachAccepted {
  type: "reach_accepted";
  actor: number;
}

export interface MjaiHora {
  type: "hora";
  actor: number;
  target: number;
  pai: string;
  deltas: number[];      // score changes [p0, p1, p2, p3]
  ura_markers?: string[];
  scores?: number[];     // new scores after
}

export interface MjaiRyukyoku {
  type: "ryukyoku";
  deltas: number[];
  scores?: number[];
}

export interface MjaiEndKyoku {
  type: "end_kyoku";
}

export interface MjaiEndGame {
  type: "end_game";
}

export interface MjaiNone {
  type: "none";
}

export interface MjaiDora {
  type: "dora";
  dora_marker: string;
}

export type MjaiEvent =
  | MjaiStartKyoku
  | MjaiTsumo
  | MjaiDahai
  | MjaiChi
  | MjaiPon
  | MjaiDaiminkan
  | MjaiKakan
  | MjaiAnkan
  | MjaiReach
  | MjaiReachAccepted
  | MjaiHora
  | MjaiRyukyoku
  | MjaiEndKyoku
  | MjaiEndGame
  | MjaiNone
  | MjaiDora;

// ── Mortal Review Types ──

export interface MortalDetail {
  action: MjaiEvent;
  q_value: number;
  prob: number;
}

export interface MortalFuuro {
  type: "chi" | "pon" | "daiminkan" | "kakan" | "ankan";
  pai?: string;
  target?: number;
  consumed: string[];
}

export interface MortalState {
  tehai: string[];          // closed hand tiles
  fuuros: MortalFuuro[];   // open melds
}

export interface MortalEntry {
  junme: number;            // turn number (1-indexed)
  tiles_left: number;
  last_actor: number;
  tile: string;             // tile that triggered this decision
  state: MortalState;
  at_self_chi_pon: boolean;
  at_self_riichi: boolean;
  at_opponent_kakan: boolean;
  expected: MjaiEvent;      // AI's recommended action
  actual: MjaiEvent;        // player's actual action
  is_equal: boolean;
  details: MortalDetail[];
  shanten: number;          // -1 = tenpai, 0+ = tiles away
  at_furiten: boolean;
  actual_index: number;     // rank of actual in candidates (0 = best)
}

export interface MortalKyokuReview {
  kyoku: number;            // 0-indexed: 0-3 = East 1-4, 4-7 = South 1-4
  honba: number;
  end_status: MjaiEvent[];
  relative_scores: [number, number, number, number];
  entries: MortalEntry[];
}

export interface MortalReview {
  total_reviewed: number;
  total_matches: number;
  rating: number;
  temperature: number;
  kyokus: MortalKyokuReview[];
  model_tag: string;
}

// ── Pipeline Configuration ──

export interface PipelineConfig {
  maxMistakes: number;       // default 5
  minEvDiff: number;         // minimum |evDiff| to include, default 0.5
  reviewedPlayer: number;    // seat index 0-3
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  maxMistakes: 5,
  minEvDiff: 0.5,
  reviewedPlayer: 0,
};
