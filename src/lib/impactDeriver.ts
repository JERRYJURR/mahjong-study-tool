/**
 * Derive the Impact of a mistake from the round's outcome.
 */

import type { MortalEntry, MortalKyokuReview, MjaiHora, MjaiRyukyoku } from "../data/mortalTypes";
import type { Impact, ImpactType } from "../data/types";

/**
 * Derive impact from end_status events and the mistake context.
 */
export function deriveImpact(
  kyokuReview: MortalKyokuReview,
  entry: MortalEntry,
  reviewedPlayer: number,
): Impact {
  const endEvents = kyokuReview.end_status;

  // Find hora or ryukyoku event
  const hora = endEvents.find((e) => e.type === "hora") as MjaiHora | undefined;
  const ryukyoku = endEvents.find((e) => e.type === "ryukyoku") as MjaiRyukyoku | undefined;

  if (hora) {
    return deriveHoraImpact(hora, entry, reviewedPlayer);
  }

  if (ryukyoku) {
    return deriveRyukyokuImpact(ryukyoku, entry, reviewedPlayer);
  }

  // Unknown outcome
  return {
    type: "no_direct",
    description: "Round outcome could not be determined from available data.",
  };
}

function deriveHoraImpact(
  hora: MjaiHora,
  entry: MortalEntry,
  reviewedPlayer: number,
): Impact {
  const delta = hora.deltas?.[reviewedPlayer] ?? 0;

  // Reviewed player dealt into someone
  if (hora.target === reviewedPlayer && hora.actor !== reviewedPlayer) {
    const lostPoints = Math.abs(delta);
    return {
      type: "dealt_in",
      description: `Dealt into opponent for ${formatPoints(lostPoints)} points.`,
      pointSwing: {
        actual: formatDelta(delta),
        optimal: "0",
        diff: formatPoints(lostPoints),
      },
    };
  }

  // Reviewed player won (tsumo or ron)
  if (hora.actor === reviewedPlayer) {
    // Won but possibly for less value than optimal play would have given
    return {
      type: "position_loss",
      description: `Won the hand for ${formatDelta(delta)} points, but optimal play may have yielded more.`,
      pointSwing: {
        actual: formatDelta(delta),
        optimal: formatDelta(delta), // can't know exact optimal without simulation
        diff: "—",
      },
    };
  }

  // Someone else dealt in to someone else — reviewed player not directly involved
  return {
    type: "no_direct",
    description: `Round ended with another player winning. Your score changed by ${formatDelta(delta)}.`,
    pointSwing: delta !== 0
      ? {
          actual: formatDelta(delta),
          optimal: "0",
          diff: formatPoints(Math.abs(delta)),
        }
      : undefined,
  };
}

function deriveRyukyokuImpact(
  ryukyoku: MjaiRyukyoku,
  entry: MortalEntry,
  reviewedPlayer: number,
): Impact {
  const delta = ryukyoku.deltas?.[reviewedPlayer] ?? 0;

  if (delta < 0) {
    // Lost points in draw (was noten)
    return {
      type: "missed_win",
      description: `Round ended in exhaustive draw. Lost ${formatPoints(Math.abs(delta))} (noten penalty).`,
      pointSwing: {
        actual: formatDelta(delta),
        optimal: `+${formatPoints(Math.abs(delta))}`,
        diff: formatPoints(Math.abs(delta) * 2),
      },
    };
  }

  if (delta > 0) {
    // Gained points in draw (was tenpai)
    return {
      type: "no_direct",
      description: `Round ended in exhaustive draw. Gained ${formatDelta(delta)} (tenpai payment).`,
      pointSwing: {
        actual: formatDelta(delta),
        optimal: formatDelta(delta),
        diff: "0",
      },
    };
  }

  return {
    type: "no_direct",
    description: "Round ended in exhaustive draw with no score change.",
  };
}

function formatPoints(pts: number): string {
  return pts.toLocaleString();
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta.toLocaleString()}`;
  if (delta < 0) return delta.toLocaleString();
  return "0";
}
