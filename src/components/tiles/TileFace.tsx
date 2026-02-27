import { PIN_LAYOUTS, SOU_LAYOUTS, MAN_KANJI, HONOR_DATA, parseTile } from "../../lib/tileMap";

interface TileFaceProps {
  tile: string;
  width: number;
  height: number;
}

function PinzuFace({ num, width, height }: { num: number; width: number; height: number }) {
  const dots = PIN_LAYOUTS[num];
  if (!dots) return null;
  const fW = width * 0.7;
  const oX = width * 0.15;
  const oY = height * 0.08;
  const sc = fW / 28;

  return (
    <g>
      {dots.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={oX + cx * sc} cy={oY + cy * sc} r={3.2 * sc} fill="none" stroke="#C62828" strokeWidth={1.2 * sc} />
          <circle cx={oX + cx * sc} cy={oY + cy * sc} r={1.5 * sc} fill="#C62828" />
        </g>
      ))}
    </g>
  );
}

function SouzuBird({ width, height }: { width: number; height: number }) {
  const cx = width / 2;
  const cy = height / 2;
  return (
    <g>
      <ellipse cx={cx} cy={cy - 2} rx={width * 0.18} ry={height * 0.22} fill="#2E7D32" opacity={0.15} />
      <line x1={cx} y1={cy - height * 0.28} x2={cx} y2={cy + height * 0.28} stroke="#2E7D32" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy - height * 0.12} r={width * 0.12} fill="#2E7D32" opacity={0.85} />
      <circle cx={cx - width * 0.04} cy={cy - height * 0.14} r={1} fill="white" />
      <path d={`M${cx} ${cy + 2} Q${cx + 8} ${cy - 4} ${cx + 3} ${cy - 8}`} fill="none" stroke="#2E7D32" strokeWidth={1.5} />
      <path d={`M${cx} ${cy + 2} Q${cx - 8} ${cy - 4} ${cx - 3} ${cy - 8}`} fill="none" stroke="#2E7D32" strokeWidth={1.5} />
    </g>
  );
}

function SouzuFace({ num, width, height }: { num: number; width: number; height: number }) {
  if (num === 1) return <SouzuBird width={width} height={height} />;

  const layout = SOU_LAYOUTS[num];
  if (!layout || layout === "bird") return null;

  const fW = width * 0.7;
  const oX = width * 0.15;
  const oY = height * 0.08;
  const sc = fW / 28;
  const topY = oY + 3;
  const botY = oY + height * 0.78 - 3;
  const midY = (topY + botY) / 2;

  return (
    <g>
      {layout.map((cx, i) => (
        <g key={i}>
          <line x1={oX + cx * sc} y1={topY} x2={oX + cx * sc} y2={midY - 1} stroke="#2E7D32" strokeWidth={2.2 * sc} strokeLinecap="round" />
          <line x1={oX + cx * sc} y1={midY + 1} x2={oX + cx * sc} y2={botY} stroke="#2E7D32" strokeWidth={2.2 * sc} strokeLinecap="round" />
          <circle cx={oX + cx * sc} cy={midY} r={1.2 * sc} fill="#66BB6A" />
        </g>
      ))}
    </g>
  );
}

function ManzuFace({ num, width, height }: { num: number; width: number; height: number }) {
  const kanji = MAN_KANJI[num];
  if (!kanji) return null;
  return (
    <g>
      <text
        x={width / 2}
        y={height * 0.42}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: height * 0.36,
          fontWeight: 800,
          fill: "#C62828",
          fontFamily: "'Noto Serif','Hiragino Mincho Pro',serif",
        }}
      >
        {kanji}
      </text>
      <text
        x={width / 2}
        y={height * 0.74}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: height * 0.22,
          fontWeight: 700,
          fill: "#C62828",
          fontFamily: "'Noto Serif','Hiragino Mincho Pro',serif",
          opacity: 0.7,
        }}
      >
        萬
      </text>
    </g>
  );
}

function HonorFace({ tile, width, height }: { tile: string; width: number; height: number }) {
  const h = HONOR_DATA[tile];
  if (!h) return null;

  if (h.special === "haku") {
    return (
      <rect
        x={width * 0.22}
        y={height * 0.18}
        width={width * 0.56}
        height={height * 0.64}
        rx={2}
        fill="none"
        stroke="#1565C0"
        strokeWidth={2}
        opacity={0.4}
      />
    );
  }

  return (
    <text
      x={width / 2}
      y={height * 0.52}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: height * 0.48,
        fontWeight: 900,
        fill: h.color,
        fontFamily: "'Noto Serif','Hiragino Mincho Pro',serif",
      }}
    >
      {h.char}
    </text>
  );
}

export default function TileFace({ tile, width, height }: TileFaceProps) {
  const { num, suit } = parseTile(tile);

  if (suit === "p") return <PinzuFace num={num} width={width} height={height} />;
  if (suit === "s") return <SouzuFace num={num} width={width} height={height} />;
  if (suit === "m") return <ManzuFace num={num} width={width} height={height} />;
  if (suit === "z") return <HonorFace tile={tile} width={width} height={height} />;

  return null;
}
