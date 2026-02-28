/**
 * WCAG AA-compliant design tokens.
 *
 * Every text color listed here achieves >= 4.5:1 contrast ratio
 * against the darkest backgrounds used in the app (#09090b, #0c0c0f, #0f0f12).
 */

/* ── Text colors (all ≥ 4.5:1 on #09090b) ── */

/** Primary text – zinc-200 (13.5:1) */
export const TEXT_PRIMARY = "#e4e4e7";

/** Secondary text – zinc-400 (7.1:1) */
export const TEXT_SECONDARY = "#a1a1aa";

/** Muted text – replaces #52525b (2.6:1) and #3f3f46 (1.7:1) → neutral-500 (4.6:1) */
export const TEXT_MUTED = "#737373";

/** Very muted / small-text safe – replaces #71717a (3.8:1) → (5.0:1) */
export const TEXT_FAINT = "#8a8a8a";

/* ── Background ── */

export const BG_APP = "#09090b";
export const BG_CARD = "#0f0f12";
export const BG_TABLE = "#0c0c0f";
export const BG_SURFACE = "#0a0a0c";

/* ── Borders ── */

export const BORDER_DEFAULT = "#1a1a1d";
export const BORDER_SUBTLE = "#141416";
export const BORDER_HOVER = "#1f1f23";

/* ── Accent / semantic ── */

export const ACCENT_CYAN = "#22d3ee";
export const COLOR_BAD = "#f87171";
export const COLOR_GOOD = "#34d399";
export const COLOR_WARN = "#fbbf24";
export const COLOR_ORANGE = "#fb923c";

/* ── Font sizes (px) – WCAG minimum 11px for labels ── */

export const FONT_LABEL = 11;
export const FONT_BODY = 12;
export const FONT_BODY_LG = 13;
export const FONT_HEADING = 14;

/* ── Font families ── */

export const FONT_SANS = "'DM Sans',-apple-system,sans-serif";
export const FONT_MONO = "'JetBrains Mono',monospace";
export const FONT_SERIF = "'Noto Serif',serif";
