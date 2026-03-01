# Mahjong Replay Study Tool

AI-powered post-game analysis for Mahjong Soul (riichi mahjong). Takes replay data analyzed by Mortal AI, identifies mistakes, and uses Claude to generate natural language explanations.

## Tech Stack

- **Vite + React + TypeScript**
- **Tailwind CSS** for styling (dark theme, zinc palette with cyan accents)
- **No component library** — custom components, SVG tile files in `public/tiles/`
- **Anthropic SDK** for Claude API integration (client + server)

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── tiles/          # Tile rendering (SVG files in public/tiles/)
│   │   ├── Tile.tsx           # Base tile: face-up, facedown, sideways states
│   │   ├── TileRow.tsx        # Horizontal tile layout with optional highlight
│   │   ├── DiscardPond.tsx    # 6-col grid, riichi tile rotated sideways
│   │   ├── OpenMeld.tsx       # Called tiles with sideways indicator
│   │   └── HandBacks.tsx      # Facedown tiles for opponent closed hands
│   ├── board/
│   │   ├── TableBoard.tsx     # Full 4-player table layout
│   │   ├── CenterPond.tsx     # All 4 discard ponds around wind indicator
│   │   └── SeatBadge.tsx      # Player label, seat wind, score, riichi/dealer
│   ├── analysis/
│   │   ├── MistakeCard.tsx    # Expandable mistake with all sub-panels
│   │   ├── ImpactPanel.tsx    # What happened + point swing comparison
│   │   ├── HandComparison.tsx # Your play vs optimal (red/green highlights)
│   │   ├── AnalysisText.tsx   # Numbered explanation + takeaway principle
│   │   └── GeneratePanel.tsx  # AI generation workflow (API key, progress)
│   ├── chat/
│   │   └── MistakeChat.tsx    # Per-mistake follow-up chat with Claude
│   ├── upload/
│   │   ├── ReplayInput.tsx    # Replay file input container
│   │   ├── ReplayUpload.tsx   # File upload for mjai/Mortal data
│   │   └── PlayerLookup.tsx   # Player lookup interface
│   └── layout/
│       └── Header.tsx         # Sticky header with replay metadata
├── data/
│   ├── types.ts          # All TypeScript interfaces
│   ├── mortalTypes.ts    # Mortal/mjai event type definitions
│   └── mockData.ts       # Mock mistakes for development
├── lib/
│   ├── tileMap.ts            # Tile notation → SVG rendering data
│   ├── utils.ts              # Formatting helpers (EV colors, score display)
│   ├── claudeApi.ts          # Claude API client (explanation generation)
│   ├── pipeline.ts           # Mortal review → Mistake[] transformation
│   ├── fileParsers.ts        # mjai/Mortal file parsing and detection
│   ├── gameStateTracker.ts   # Board state reconstruction from mjai log
│   ├── tileNormalize.ts      # Tile notation normalization
│   ├── actionFormat.ts       # Action string formatting
│   ├── categoryClassifier.ts # Mistake categorization logic
│   └── impactDeriver.ts      # Impact calculation
├── App.tsx
└── main.tsx
server/
└── src/
    ├── index.ts              # Express server with /api/explain endpoint
    └── services/
        └── claudeApi.ts      # Server-side Claude API integration
```

## Design System

### Colors (dark theme)
- Background: `#09090b` (zinc-950)
- Card: `#0f0f12`
- Border: `#1a1a1d`
- Subtle border: `#141416`
- Text primary: `#e4e4e7` (zinc-200)
- Text secondary: `#a1a1aa` (zinc-400)
- Text muted: `#52525b` (zinc-600)
- Accent: `#22d3ee` (cyan-400)
- Bad/error: `#f87171` (red-400)
- Good/optimal: `#34d399` (emerald-400)
- Warning: `#fbbf24` (amber-400)

### Fonts
- Body: `DM Sans`
- Mono: `JetBrains Mono` (scores, EV values)
- Kanji/serif: `Noto Serif` (tile faces, wind indicator)

### Tile Sizes (width × height px)
- `xxs`: 22×30 — not currently used but available
- `xs`: 28×38 — discard ponds, opponent hands, open melds
- `sm`: 36×49 — dora indicator
- `md`: 44×60 — your hand tiles
- `lg`: 52×71 — comparison tiles (your play vs optimal)

## Tile System

All tiles render as inline SVGs. **No external image dependencies.**

### Tile Notation
- Manzu: `1m`–`9m` (characters, red kanji + 萬)
- Pinzu: `1p`–`9p` (circles, red outlined dots)
- Souzu: `1s`–`9s` (bamboo, green sticks; 1s is bird motif)
- Winds: `1z`=東, `2z`=南, `3z`=西, `4z`=北 (blue)
- Dragons: `5z`=白(haku, empty bordered rect), `6z`=發(green), `7z`=中(red)
- Red fives: `0m`, `0p`, `0s` (dedicated SVG files in `public/tiles/`)

### Tile States
- **Face-up**: cream gradient background, SVG face
- **Facedown**: dark green with inner border frame
- **Sideways**: rotated 90° via SVG transform (for riichi discards and called tiles)
- **Highlighted**: colored border + glow (red=bad, green=good)
- **Dimmed**: opacity 0.3

## Table Board Layout

CSS Grid with 3×3 structure:
```
.         toimen      .
kamicha   center      shimocha
.         you         .
```

- **Toimen** (top): hand rotated 180° at far edge, discards in center pond
- **Kamicha** (left): hand rotated 90° CW at left edge, discards in center pond
- **Shimocha** (right): hand rotated -90° CCW at right edge, discards in center pond
- **You** (bottom): hand normal at bottom, discards in center pond
- **Center pond**: nested grid with all 4 discard zones around wind indicator

## Key Data Types

```typescript
interface Mistake {
  id: number;
  round: string;           // "East 2", "South 1 Honba 1"
  turn: number;
  evDiff: number;          // negative, e.g. -3.42
  category: "Push/Fold" | "Efficiency" | "Riichi Decision" | "Calling Decision" | "Defense";
  hand: string[];          // 13 tiles in notation
  drew: string | null;     // tile drawn this turn
  yourDiscard: string | null;
  optimalDiscard: string;  // may include text like "Chi 5m → discard 6z"
  boardState: BoardState;
  impact: Impact;
  explanation: Explanation;
}

interface BoardState {
  roundWind: "East" | "South" | "West";
  turnNumber: number;
  dora: string;
  honba: number;
  you: PlayerState;
  kamicha: PlayerState;
  toimen: PlayerState;
  shimocha: PlayerState;
}

interface PlayerState {
  seat: "East" | "South" | "West" | "North";
  score: number;
  discards: string[];
  closedHandCount: number;
  isRiichi: boolean;
  riichiTurnIndex?: number;  // which discard is the riichi declaration
  isDealer: boolean;
  openMelds: Meld[];
}

interface Meld {
  type: "chi" | "pon" | "kan" | "ankan";
  tiles: string[];
  calledFrom?: number;  // index of sideways tile (0-based)
}

interface Impact {
  type: "dealt_in" | "missed_win" | "position_loss" | "no_direct";
  description: string;
  pointSwing?: {
    actual: string;
    optimal: string;
    diff: string;
  };
}

interface Explanation {
  summary: string;
  details: string[];      // 4 numbered analysis points
  principle: string;      // takeaway rule
}
```

## Current Status

- [x] Component prototype with inline SVG tiles (artifact)
- [x] Mock data for 5 mistake categories
- [x] Table board layout with rotated opponents
- [x] Impact panel, analysis text, chat stub
- [x] Port prototype to Vite project with proper components
- [x] TypeScript interfaces for all data
- [x] Red five rendering (0m, 0p, 0s) — SVG files in `public/tiles/`
- [x] Data pipeline (mjai/Mortal parsing) — full pipeline with game state tracking
- [x] Claude API integration — client + server, API key management, batch generation
- [x] Upload UI for replay files and player lookup
- [ ] Responsive/mobile layout — flexbox adapts but no media queries or mobile-specific UX

## Coding Conventions

- Functional components only, no classes
- Prefer inline styles for component-specific styling, Tailwind for layout utilities
- No `any` types — define interfaces for everything
- Tile notation always lowercase: `1m`, `5z`, `0p`
- Colors as hex strings, not Tailwind classes in component styles
- SVG tiles are loaded from `public/tiles/` via `<img>` tags

## Reference

The original prototype is in `reference/mahjong-study-tool.jsx` — a single-file React component. The prototype has been fully ported into the component structure above.
