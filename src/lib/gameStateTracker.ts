/**
 * Replays an mjai event log to reconstruct full 4-player board state
 * at any decision point. The Mortal review only contains the reviewed
 * player's hand — this module provides everyone else's visible state.
 */

import type {
  MjaiEvent,
  MjaiStartKyoku,
  MortalEntry,
} from "../data/mortalTypes";
import type {
  BoardState,
  Meld,
  PlayerState,
  TileNotation,
  Wind,
} from "../data/types";
import {
  normalizeTile,
  normalizeTiles,
  normalizeWind,
  seatToWind,
  formatRound,
  doraFromIndicator,
} from "./tileNormalize";

/** Internal tracked state for a single player */
interface TrackedPlayer {
  discards: TileNotation[];
  openMelds: Meld[];
  score: number;
  isRiichi: boolean;
  riichiTurnIndex: number | undefined;
  isDealer: boolean;
  seatWind: Wind;
  closedTileCount: number; // track closed hand size
}

/** Snapshot of the full game state at a point in time */
export interface GameSnapshot {
  roundWind: Wind;
  turnNumber: number;
  honba: number;
  dora: TileNotation;
  doraIndicators: TileNotation[];
  players: [TrackedPlayer, TrackedPlayer, TrackedPlayer, TrackedPlayer];
  oya: number;
}

/** Map of kyoku events keyed by "kyoku-honba" */
type KyokuEventMap = Map<string, MjaiEvent[]>;

function makeKey(kyoku: number, honba: number): string {
  return `${kyoku}-${honba}`;
}

function initPlayer(
  score: number,
  seatWind: Wind,
  isDealer: boolean,
): TrackedPlayer {
  return {
    discards: [],
    openMelds: [],
    score,
    isRiichi: false,
    riichiTurnIndex: undefined,
    isDealer,
    seatWind,
    closedTileCount: 13,
  };
}

/** Convert a MortalFuuro-style meld or mjai call event into an app Meld */
function convertMeld(
  type: "chi" | "pon" | "kan" | "ankan",
  calledTile: string,
  consumed: string[],
  callerIndex: number,
  targetIndex: number,
): Meld {
  const tiles = normalizeTiles([calledTile, ...consumed]);

  // For chi: sort tiles numerically; called tile (from target) is sideways
  // calledFrom = index of the called tile in the sorted meld
  let calledFrom: number | undefined;

  if (type === "chi") {
    // Sort by tile number for display
    tiles.sort((a, b) => {
      const na = parseInt(a, 10) || 0;
      const nb = parseInt(b, 10) || 0;
      return na - nb;
    });
    calledFrom = tiles.indexOf(normalizeTile(calledTile));
  } else if (type === "pon") {
    // calledFrom indicates which of the 3 tiles is sideways (from target)
    // Convention: relative position of target to caller determines index
    const rel = (targetIndex - callerIndex + 4) % 4;
    // 1 = shimocha (right) → last tile, 2 = toimen → middle, 3 = kamicha → first
    if (rel === 3) calledFrom = 0;
    else if (rel === 2) calledFrom = 1;
    else calledFrom = 2;
  }

  return { type, tiles, calledFrom };
}

export class GameStateTracker {
  private kyokuEvents: KyokuEventMap;
  private initialScores: number[];

  constructor(mjaiEvents: MjaiEvent[]) {
    this.kyokuEvents = new Map();
    this.initialScores = [25000, 25000, 25000, 25000];

    let currentKey: string | null = null;

    for (const event of mjaiEvents) {
      if (event.type === "start_kyoku") {
        currentKey = makeKey(event.kyoku, event.honba);
        this.kyokuEvents.set(currentKey, [event]);
      } else if (currentKey) {
        this.kyokuEvents.get(currentKey)!.push(event);
      }
    }
  }

  /**
   * Get a full board state snapshot at the moment of a specific Entry.
   * kyoku: 0-indexed tenhou format (0-3 = East, 4-7 = South)
   */
  getSnapshot(
    kyoku: number,
    honba: number,
    entry: MortalEntry,
    reviewedPlayer: number,
  ): GameSnapshot | null {
    const key = makeKey(kyoku, honba);
    const events = this.kyokuEvents.get(key);
    if (!events || events.length === 0) return null;

    const startEvent = events[0] as MjaiStartKyoku;
    const oya = startEvent.oya;
    const roundWind = normalizeWind(startEvent.bakaze);
    const doraIndicators = [normalizeTile(startEvent.dora_marker)];

    // Initialize players from start_kyoku
    const players: [TrackedPlayer, TrackedPlayer, TrackedPlayer, TrackedPlayer] = [
      initPlayer(0, seatToWind(0, oya), 0 === oya),
      initPlayer(0, seatToWind(1, oya), 1 === oya),
      initPlayer(0, seatToWind(2, oya), 2 === oya),
      initPlayer(0, seatToWind(3, oya), 3 === oya),
    ];

    // Set scores from startEvent if available, else use relative_scores
    // mjai start_kyoku doesn't always have scores; use tracked scores
    // For initial round, use defaults. Scores get updated from hora/ryukyoku deltas.
    for (let i = 0; i < 4; i++) {
      players[i].score = this.initialScores[i];
    }

    // Track reviewed player's turn count to match entry.junme
    let reviewedTurnCount = 0;

    // Replay events to find the matching decision point
    for (let i = 1; i < events.length; i++) {
      const ev = events[i];

      // Check if we've reached the matching decision point
      // Match on: reviewed player's turn count equals entry.junme
      // and the triggering tile matches
      if (ev.type === "tsumo" && ev.actor === reviewedPlayer) {
        reviewedTurnCount++;
        if (
          reviewedTurnCount === entry.junme &&
          !entry.at_self_chi_pon
        ) {
          // This is the draw that triggered the decision
          // Return snapshot BEFORE applying this draw
          return {
            roundWind: roundWind as Wind,
            turnNumber: entry.junme,
            honba,
            dora: doraFromIndicator(startEvent.dora_marker),
            doraIndicators,
            players,
            oya,
          };
        }
      }

      // For calling decisions, match on the opponent's discard
      if (
        entry.at_self_chi_pon &&
        ev.type === "dahai" &&
        ev.actor !== reviewedPlayer &&
        normalizeTile(ev.pai) === normalizeTile(entry.tile) &&
        reviewedTurnCount === entry.junme - 1
      ) {
        // Apply this discard first, then return snapshot
        applyEvent(players, ev);
        return {
          roundWind: roundWind as Wind,
          turnNumber: entry.junme,
          honba,
          dora: doraFromIndicator(startEvent.dora_marker),
          doraIndicators,
          players,
          oya,
        };
      }

      // Apply event to tracked state
      applyEvent(players, ev);

      // Track new dora from kan
      if (ev.type === "dora") {
        doraIndicators.push(normalizeTile(ev.dora_marker));
      }
    }

    // Fallback: return last known state
    return {
      roundWind: roundWind as Wind,
      turnNumber: entry.junme,
      honba,
      dora: doraFromIndicator(startEvent.dora_marker),
      doraIndicators,
      players,
      oya,
    };
  }

  /**
   * Convert a GameSnapshot to a BoardState, mapping absolute seats
   * to relative positions (you/kamicha/toimen/shimocha).
   */
  snapshotToBoardState(
    snapshot: GameSnapshot,
    reviewedPlayer: number,
    entry: MortalEntry,
  ): BoardState {
    const shimoIdx = (reviewedPlayer + 1) % 4;
    const toimenIdx = (reviewedPlayer + 2) % 4;
    const kamiIdx = (reviewedPlayer + 3) % 4;

    const toPlayerState = (p: TrackedPlayer): PlayerState => ({
      seat: p.seatWind,
      score: p.score,
      discards: p.discards,
      closedHandCount: p.closedTileCount,
      isRiichi: p.isRiichi,
      riichiTurnIndex: p.riichiTurnIndex,
      isDealer: p.isDealer,
      openMelds: p.openMelds,
    });

    // For the reviewed player, use the entry's state for accurate hand count
    const youState = toPlayerState(snapshot.players[reviewedPlayer]);
    youState.closedHandCount = entry.state.tehai.length;

    return {
      roundWind: snapshot.roundWind as "East" | "South" | "West",
      turnNumber: snapshot.turnNumber,
      dora: snapshot.dora,
      honba: snapshot.honba,
      you: youState,
      kamicha: toPlayerState(snapshot.players[kamiIdx]),
      toimen: toPlayerState(snapshot.players[toimenIdx]),
      shimocha: toPlayerState(snapshot.players[shimoIdx]),
    };
  }

  /** Update tracked initial scores (call after processing each round's outcome) */
  updateScores(deltas: number[]): void {
    for (let i = 0; i < 4; i++) {
      this.initialScores[i] += deltas[i];
    }
  }

  /** Set initial scores explicitly */
  setInitialScores(scores: number[]): void {
    this.initialScores = [...scores];
  }
}

/** Apply a single mjai event to the tracked player states */
function applyEvent(
  players: [TrackedPlayer, TrackedPlayer, TrackedPlayer, TrackedPlayer],
  ev: MjaiEvent,
): void {
  switch (ev.type) {
    case "dahai": {
      const p = players[ev.actor];
      p.discards.push(normalizeTile(ev.pai));
      p.closedTileCount--;
      break;
    }

    case "tsumo": {
      const p = players[ev.actor];
      p.closedTileCount++;
      break;
    }

    case "chi": {
      const caller = players[ev.actor];
      const target = players[ev.target];
      // Remove the last discard from target's pond (it was called)
      target.discards.pop();
      // Add meld to caller
      caller.openMelds.push(
        convertMeld("chi", ev.pai, ev.consumed, ev.actor, ev.target),
      );
      // Chi consumes 2 tiles from hand, gets the called tile
      // Net: closedTileCount -= 2 (the 2 consumed tiles leave hand)
      // But caller will draw and discard next, handled by tsumo/dahai events
      caller.closedTileCount -= 2;
      break;
    }

    case "pon": {
      const caller = players[ev.actor];
      const target = players[ev.target];
      target.discards.pop();
      caller.openMelds.push(
        convertMeld("pon", ev.pai, ev.consumed, ev.actor, ev.target),
      );
      caller.closedTileCount -= 2;
      break;
    }

    case "daiminkan": {
      const caller = players[ev.actor];
      const target = players[ev.target];
      target.discards.pop();
      caller.openMelds.push(
        convertMeld("kan", ev.pai, ev.consumed, ev.actor, ev.target),
      );
      caller.closedTileCount -= 3;
      break;
    }

    case "ankan": {
      const caller = players[ev.actor];
      const tiles = normalizeTiles(ev.consumed);
      caller.openMelds.push({
        type: "ankan",
        tiles,
      });
      caller.closedTileCount -= 4;
      break;
    }

    case "kakan": {
      const caller = players[ev.actor];
      // Find existing pon meld and upgrade to kan
      const ponIdx = caller.openMelds.findIndex(
        (m) => m.type === "pon" && m.tiles.includes(normalizeTile(ev.pai)),
      );
      if (ponIdx !== -1) {
        const pon = caller.openMelds[ponIdx];
        caller.openMelds[ponIdx] = {
          type: "kan",
          tiles: [...pon.tiles, normalizeTile(ev.pai)],
          calledFrom: pon.calledFrom,
        };
      }
      caller.closedTileCount--;
      break;
    }

    case "reach": {
      // Mark riichi (score deduction happens at reach_accepted)
      break;
    }

    case "reach_accepted": {
      const p = players[ev.actor];
      p.isRiichi = true;
      p.riichiTurnIndex = p.discards.length - 1; // last discard was the riichi tile
      p.score -= 1000;
      break;
    }

    case "hora": {
      // Update scores
      if (ev.deltas) {
        for (let i = 0; i < 4; i++) {
          players[i].score += ev.deltas[i];
        }
      }
      break;
    }

    case "ryukyoku": {
      if (ev.deltas) {
        for (let i = 0; i < 4; i++) {
          players[i].score += ev.deltas[i];
        }
      }
      break;
    }

    // Events that don't affect tracked state
    case "start_kyoku":
    case "end_kyoku":
    case "end_game":
    case "none":
    case "dora":
      break;
  }
}
