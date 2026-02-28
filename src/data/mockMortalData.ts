/**
 * Mock Mortal review data + mjai event log for development.
 * This simulates what a real Mortal analysis would produce,
 * allowing the pipeline to be tested without actual Mortal output.
 *
 * Scenario: 4-player East game, player 0 (East→South→South→South)
 * 3 rounds with 5 notable mistakes across them.
 */

import type { MjaiEvent, MortalReview } from "./mortalTypes";

// ── Mock mjai Event Log ──
// A simplified East-only game with 3 rounds

export const MOCK_MJAI_LOG: MjaiEvent[] = [
  // ═══ East 1 (kyoku=0, honba=0) — player 2 is dealer ═══
  {
    type: "start_kyoku",
    bakaze: "E",
    kyoku: 1,
    honba: 0,
    kyotaku: 0,
    oya: 2,
    dora_marker: "3s",
    tehais: [
      ["2m","3m","4m","6m","7m","2p","3p","0p","6p","7p","4s","0s","7z"],  // player 0
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
    ],
  },
  // Player 2 (dealer) draws and discards
  { type: "tsumo", actor: 2, pai: "1z" },
  { type: "dahai", actor: 2, pai: "1z", tsumogiri: true },
  // Player 3
  { type: "tsumo", actor: 3, pai: "9s" },
  { type: "dahai", actor: 3, pai: "7z", tsumogiri: false },
  // Player 0 turn 1
  { type: "tsumo", actor: 0, pai: "1z" },
  { type: "dahai", actor: 0, pai: "1z", tsumogiri: true },
  // Player 1
  { type: "tsumo", actor: 1, pai: "9p" },
  { type: "dahai", actor: 1, pai: "1m", tsumogiri: false },
  // Player 2
  { type: "tsumo", actor: 2, pai: "8s" },
  { type: "dahai", actor: 2, pai: "9p", tsumogiri: false },
  // Player 3
  { type: "tsumo", actor: 3, pai: "2z" },
  { type: "dahai", actor: 3, pai: "1s", tsumogiri: false },
  // Player 0 turn 2
  { type: "tsumo", actor: 0, pai: "9s" },
  { type: "dahai", actor: 0, pai: "9s", tsumogiri: true },
  // Player 1
  { type: "tsumo", actor: 1, pai: "3z" },
  { type: "dahai", actor: 1, pai: "9p", tsumogiri: false },
  // Player 2
  { type: "tsumo", actor: 2, pai: "5z" },
  { type: "dahai", actor: 2, pai: "8s", tsumogiri: false },
  // Player 3
  { type: "tsumo", actor: 3, pai: "4z" },
  { type: "dahai", actor: 3, pai: "2z", tsumogiri: false },
  // Player 0 turn 3
  { type: "tsumo", actor: 0, pai: "3z" },
  { type: "dahai", actor: 0, pai: "3z", tsumogiri: true },
  // Continue a few more turns...
  { type: "tsumo", actor: 1, pai: "6z" },
  { type: "dahai", actor: 1, pai: "8s", tsumogiri: false },
  { type: "tsumo", actor: 2, pai: "1p" },
  { type: "dahai", actor: 2, pai: "5z", tsumogiri: false },
  { type: "tsumo", actor: 3, pai: "8m" },
  { type: "dahai", actor: 3, pai: "4z", tsumogiri: false },
  // Player 0 turn 4
  { type: "tsumo", actor: 0, pai: "5p" },
  { type: "dahai", actor: 0, pai: "5p", tsumogiri: false },
  // More turns...
  { type: "tsumo", actor: 1, pai: "2z" },
  { type: "dahai", actor: 1, pai: "2z", tsumogiri: true },
  { type: "tsumo", actor: 2, pai: "4z" },
  { type: "dahai", actor: 2, pai: "4z", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "5z" },
  { type: "dahai", actor: 3, pai: "5z", tsumogiri: true },
  // Player 0 turn 5 — toimen declares riichi
  { type: "tsumo", actor: 0, pai: "8m" },
  { type: "dahai", actor: 0, pai: "8m", tsumogiri: true },
  { type: "tsumo", actor: 1, pai: "3m" },
  { type: "dahai", actor: 1, pai: "6z", tsumogiri: false },
  // Toimen (player 2) reaches
  { type: "tsumo", actor: 2, pai: "2m" },
  { type: "reach", actor: 2 },
  { type: "dahai", actor: 2, pai: "1p", tsumogiri: false },
  { type: "reach_accepted", actor: 2 },
  // Player 3
  { type: "tsumo", actor: 3, pai: "9m" },
  { type: "dahai", actor: 3, pai: "9m", tsumogiri: true },
  // Player 0 turn 6 — draws 7z (safe), discards 0p (dangerous) — MISTAKE
  { type: "tsumo", actor: 0, pai: "7z" },
  { type: "dahai", actor: 0, pai: "0p", tsumogiri: false },
  // Player 1
  { type: "tsumo", actor: 1, pai: "4p" },
  { type: "dahai", actor: 1, pai: "4p", tsumogiri: true },
  // Player 2 tsumos (riichi player)
  { type: "tsumo", actor: 2, pai: "6m" },
  { type: "dahai", actor: 2, pai: "6m", tsumogiri: true },
  // Player 3
  { type: "tsumo", actor: 3, pai: "1p" },
  { type: "dahai", actor: 3, pai: "8m", tsumogiri: false },
  // Player 0 turn 7 — discards something else
  { type: "tsumo", actor: 0, pai: "9p" },
  { type: "dahai", actor: 0, pai: "9p", tsumogiri: false },
  // Player 0 dealt into player 2's riichi
  {
    type: "hora",
    actor: 2,
    target: 0,
    pai: "0p",
    deltas: [-7700, 0, 7700, 0],
    scores: [17300, 25000, 32700, 25000],
  },
  { type: "end_kyoku" },

  // ═══ East 2 (kyoku=1, honba=0) — player 3 is dealer ═══
  {
    type: "start_kyoku",
    bakaze: "E",
    kyoku: 2,
    honba: 0,
    kyotaku: 0,
    oya: 3,
    dora_marker: "2p",
    tehais: [
      ["1m","2m","3m","0m","5m","3p","4p","7p","8p","3s","4s","0s","6s"],  // player 0
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
    ],
  },
  // Abbreviated: several turns of normal play
  { type: "tsumo", actor: 3, pai: "7z" },
  { type: "dahai", actor: 3, pai: "7z", tsumogiri: true },
  { type: "tsumo", actor: 0, pai: "9m" },
  { type: "dahai", actor: 0, pai: "9m", tsumogiri: true },
  { type: "tsumo", actor: 1, pai: "2z" },
  { type: "dahai", actor: 1, pai: "7z", tsumogiri: false },
  { type: "tsumo", actor: 2, pai: "1z" },
  { type: "dahai", actor: 2, pai: "1z", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "5z" },
  { type: "dahai", actor: 3, pai: "5z", tsumogiri: true },
  // Player 0 turn 2 — draws 6p, discards 6s (MISTAKE — should discard 0m)
  { type: "tsumo", actor: 0, pai: "6p" },
  { type: "dahai", actor: 0, pai: "6s", tsumogiri: false },
  // More play...
  { type: "tsumo", actor: 1, pai: "9p" },
  { type: "dahai", actor: 1, pai: "2z", tsumogiri: false },
  { type: "tsumo", actor: 2, pai: "4z" },
  { type: "dahai", actor: 2, pai: "4z", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "9s" },
  { type: "dahai", actor: 3, pai: "9s", tsumogiri: true },
  // Player 0 turn 3
  { type: "tsumo", actor: 0, pai: "1z" },
  { type: "dahai", actor: 0, pai: "1z", tsumogiri: true },
  // Round ends — player 0 wins smaller hand later
  { type: "tsumo", actor: 1, pai: "8p" },
  { type: "dahai", actor: 1, pai: "9p", tsumogiri: false },
  { type: "tsumo", actor: 2, pai: "9p" },
  { type: "dahai", actor: 2, pai: "9p", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "3z" },
  { type: "dahai", actor: 3, pai: "3z", tsumogiri: true },
  { type: "tsumo", actor: 0, pai: "2s" },
  {
    type: "hora",
    actor: 0,
    target: 0,
    pai: "2s",
    deltas: [3900, -1300, -1300, -1300],
    scores: [21200, 23700, 31400, 23700],
  },
  { type: "end_kyoku" },

  // ═══ East 3 (kyoku=2, honba=0) — player 0 is dealer ═══
  {
    type: "start_kyoku",
    bakaze: "E",
    kyoku: 3,
    honba: 0,
    kyotaku: 0,
    oya: 0,
    dora_marker: "5p",
    tehais: [
      ["4m","5m","6m","2p","3p","4p","6p","7p","8p","6s","7s","8s","3m"],  // player 0
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
      ["?","?","?","?","?","?","?","?","?","?","?","?","?"],
    ],
  },
  // Many turns of discards (honor/terminal cleanup)
  { type: "tsumo", actor: 0, pai: "1z" },
  { type: "dahai", actor: 0, pai: "1z", tsumogiri: true },
  { type: "tsumo", actor: 1, pai: "2z" },
  { type: "dahai", actor: 1, pai: "2z", tsumogiri: true },
  { type: "tsumo", actor: 2, pai: "9s" },
  { type: "dahai", actor: 2, pai: "9s", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "6z" },
  { type: "dahai", actor: 3, pai: "6z", tsumogiri: true },
  { type: "tsumo", actor: 0, pai: "4z" },
  { type: "dahai", actor: 0, pai: "4z", tsumogiri: true },
  { type: "tsumo", actor: 1, pai: "7z" },
  { type: "dahai", actor: 1, pai: "7z", tsumogiri: true },
  { type: "tsumo", actor: 2, pai: "5z" },
  { type: "dahai", actor: 2, pai: "5z", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "2z" },
  { type: "dahai", actor: 3, pai: "2z", tsumogiri: true },
  { type: "tsumo", actor: 0, pai: "9m" },
  { type: "dahai", actor: 0, pai: "9m", tsumogiri: true },
  { type: "tsumo", actor: 1, pai: "1z" },
  { type: "dahai", actor: 1, pai: "1z", tsumogiri: true },
  { type: "tsumo", actor: 2, pai: "3z" },
  { type: "dahai", actor: 2, pai: "3z", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "9m" },
  { type: "dahai", actor: 3, pai: "9m", tsumogiri: true },
  // More middle-game turns
  { type: "tsumo", actor: 0, pai: "1p" },
  { type: "dahai", actor: 0, pai: "1p", tsumogiri: true },
  { type: "tsumo", actor: 1, pai: "9p" },
  { type: "dahai", actor: 1, pai: "9p", tsumogiri: true },
  { type: "tsumo", actor: 2, pai: "1z" },
  { type: "dahai", actor: 2, pai: "1z", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "1m" },
  { type: "dahai", actor: 3, pai: "1m", tsumogiri: true },
  { type: "tsumo", actor: 0, pai: "9s" },
  { type: "dahai", actor: 0, pai: "9s", tsumogiri: true },
  { type: "tsumo", actor: 1, pai: "5z" },
  { type: "dahai", actor: 1, pai: "5z", tsumogiri: true },
  { type: "tsumo", actor: 2, pai: "9p" },
  { type: "dahai", actor: 2, pai: "9p", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "4z" },
  { type: "dahai", actor: 3, pai: "4z", tsumogiri: true },
  // Turn 7-ish for player 0 — reaches tenpai, discards 3m dama (MISTAKE — should riichi)
  { type: "tsumo", actor: 0, pai: "3m" },
  { type: "dahai", actor: 0, pai: "3m", tsumogiri: true },
  // Round continues...
  { type: "tsumo", actor: 1, pai: "3z" },
  { type: "dahai", actor: 1, pai: "3z", tsumogiri: true },
  { type: "tsumo", actor: 2, pai: "8m" },
  { type: "dahai", actor: 2, pai: "8m", tsumogiri: true },
  { type: "tsumo", actor: 3, pai: "5z" },
  { type: "dahai", actor: 3, pai: "5z", tsumogiri: true },
  // Player 0 tsumos for win (but for less value without riichi)
  { type: "tsumo", actor: 0, pai: "2m" },
  {
    type: "hora",
    actor: 0,
    target: 0,
    pai: "2m",
    deltas: [7800, -2600, -2600, -2600],
    scores: [29000, 21100, 28800, 21100],
  },
  { type: "end_kyoku" },

  { type: "end_game" },
];

// ── Mock Mortal Review ──

export const MOCK_MORTAL_REVIEW: MortalReview = {
  total_reviewed: 42,
  total_matches: 37,
  rating: 0.873,
  temperature: 1.0,
  model_tag: "mortal-v4.1",
  kyokus: [
    // ═══ East 1 ═══
    {
      kyoku: 0, // East 1 (0-indexed)
      honba: 0,
      end_status: [
        {
          type: "hora",
          actor: 2,
          target: 0,
          pai: "0p",
          deltas: [-7700, 0, 7700, 0],
          scores: [17300, 25000, 32700, 25000],
        },
      ],
      relative_scores: [-7700, 0, 7700, 0],
      entries: [
        // Correct plays (turns 1-5)
        {
          junme: 1,
          tiles_left: 66,
          last_actor: 3,
          tile: "1z",
          state: {
            tehai: ["2m","3m","4m","6m","7m","2p","3p","0p","6p","7p","4s","0s","7z","1z"],
            fuuros: [],
          },
          at_self_chi_pon: false,
          at_self_riichi: false,
          at_opponent_kakan: false,
          expected: { type: "dahai", actor: 0, pai: "1z", tsumogiri: true },
          actual: { type: "dahai", actor: 0, pai: "1z", tsumogiri: true },
          is_equal: true,
          details: [
            { action: { type: "dahai", actor: 0, pai: "1z", tsumogiri: true }, q_value: 0.312, prob: 0.92 },
          ],
          shanten: 1,
          at_furiten: false,
          actual_index: 0,
        },
        // Mistake: Turn 6 — drew 7z (safe), discarded 0p (dangerous) instead of 7z
        {
          junme: 6,
          tiles_left: 44,
          last_actor: 3,
          tile: "7z",
          state: {
            tehai: ["2m","3m","4m","6m","7m","2p","3p","0p","6p","7p","4s","0s","7z","7z"],
            fuuros: [],
          },
          at_self_chi_pon: false,
          at_self_riichi: false,
          at_opponent_kakan: false,
          expected: { type: "dahai", actor: 0, pai: "7z", tsumogiri: true },
          actual: { type: "dahai", actor: 0, pai: "0p", tsumogiri: false },
          is_equal: false,
          details: [
            { action: { type: "dahai", actor: 0, pai: "7z", tsumogiri: true }, q_value: 0.312, prob: 0.85 },
            { action: { type: "dahai", actor: 0, pai: "7z", tsumogiri: false }, q_value: 0.310, prob: 0.07 },
            { action: { type: "dahai", actor: 0, pai: "0s", tsumogiri: false }, q_value: -2.80, prob: 0.03 },
            { action: { type: "dahai", actor: 0, pai: "0p", tsumogiri: false }, q_value: -3.11, prob: 0.02 },
            { action: { type: "dahai", actor: 0, pai: "6p", tsumogiri: false }, q_value: -3.25, prob: 0.01 },
          ],
          shanten: 1,
          at_furiten: false,
          actual_index: 3,
        },
      ],
    },

    // ═══ East 2 ═══
    {
      kyoku: 1, // East 2
      honba: 0,
      end_status: [
        {
          type: "hora",
          actor: 0,
          target: 0,
          pai: "2s",
          deltas: [3900, -1300, -1300, -1300],
          scores: [21200, 23700, 31400, 23700],
        },
      ],
      relative_scores: [3900, -1300, -1300, -1300],
      entries: [
        // Mistake: Turn 2 — discarded 6s instead of 0m (efficiency)
        {
          junme: 2,
          tiles_left: 58,
          last_actor: 2,
          tile: "6p",
          state: {
            tehai: ["1m","2m","3m","0m","5m","3p","4p","6p","7p","8p","3s","4s","0s","6s"],
            fuuros: [],
          },
          at_self_chi_pon: false,
          at_self_riichi: false,
          at_opponent_kakan: false,
          expected: { type: "dahai", actor: 0, pai: "0m", tsumogiri: false },
          actual: { type: "dahai", actor: 0, pai: "6s", tsumogiri: false },
          is_equal: false,
          details: [
            { action: { type: "dahai", actor: 0, pai: "0m", tsumogiri: false }, q_value: 1.45, prob: 0.72 },
            { action: { type: "dahai", actor: 0, pai: "5m", tsumogiri: false }, q_value: 1.20, prob: 0.15 },
            { action: { type: "dahai", actor: 0, pai: "6s", tsumogiri: false }, q_value: -1.42, prob: 0.05 },
            { action: { type: "dahai", actor: 0, pai: "0s", tsumogiri: false }, q_value: -1.58, prob: 0.04 },
          ],
          shanten: 1,
          at_furiten: false,
          actual_index: 2,
        },
      ],
    },

    // ═══ East 3 ═══
    {
      kyoku: 2, // East 3
      honba: 0,
      end_status: [
        {
          type: "hora",
          actor: 0,
          target: 0,
          pai: "2m",
          deltas: [7800, -2600, -2600, -2600],
          scores: [29000, 21100, 28800, 21100],
        },
      ],
      relative_scores: [7800, -2600, -2600, -2600],
      entries: [
        // Many correct plays (turns 1-6)...
        {
          junme: 1,
          tiles_left: 66,
          last_actor: 3,
          tile: "1z",
          state: {
            tehai: ["3m","4m","5m","6m","2p","3p","4p","6p","7p","8p","6s","7s","8s","1z"],
            fuuros: [],
          },
          at_self_chi_pon: false,
          at_self_riichi: false,
          at_opponent_kakan: false,
          expected: { type: "dahai", actor: 0, pai: "1z", tsumogiri: true },
          actual: { type: "dahai", actor: 0, pai: "1z", tsumogiri: true },
          is_equal: true,
          details: [
            { action: { type: "dahai", actor: 0, pai: "1z", tsumogiri: true }, q_value: 0.85, prob: 0.95 },
          ],
          shanten: 0,
          at_furiten: false,
          actual_index: 0,
        },
        // Mistake: Turn 7 — tenpai, discarded 3m dama instead of declaring riichi
        {
          junme: 7,
          tiles_left: 42,
          last_actor: 3,
          tile: "3m",
          state: {
            tehai: ["3m","4m","5m","6m","2p","3p","4p","6p","7p","8p","6s","7s","8s","3m"],
            fuuros: [],
          },
          at_self_chi_pon: false,
          at_self_riichi: true,
          at_opponent_kakan: false,
          expected: { type: "reach", actor: 0 },
          actual: { type: "dahai", actor: 0, pai: "3m", tsumogiri: true },
          is_equal: false,
          details: [
            { action: { type: "reach", actor: 0 }, q_value: 2.85, prob: 0.78 },
            { action: { type: "dahai", actor: 0, pai: "3m", tsumogiri: true }, q_value: 0.90, prob: 0.18 },
            { action: { type: "dahai", actor: 0, pai: "6m", tsumogiri: false }, q_value: -0.45, prob: 0.02 },
          ],
          shanten: -1,
          at_furiten: false,
          actual_index: 1,
        },
      ],
    },
  ],
};
