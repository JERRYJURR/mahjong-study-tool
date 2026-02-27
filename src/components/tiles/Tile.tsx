import { useId } from "react";
import type { TileSize, TileNotation, HighlightType } from "../../data/types";
import { TILE_SIZES } from "../../lib/tileMap";
import TileFace from "./TileFace";

interface TileProps {
  tile?: TileNotation;
  highlight?: HighlightType;
  dimmed?: boolean;
  size?: TileSize;
  facedown?: boolean;
  sideways?: boolean;
}

export default function Tile({
  tile,
  highlight,
  dimmed,
  size = "md",
  facedown,
  sideways,
}: TileProps) {
  const gradientId = useId();
  const s = TILE_SIZES[size];
  const tileW = s.w;
  const tileH = s.h;
  const outerW = sideways ? tileH : tileW;
  const outerH = sideways ? tileW : tileH;

  const ringStroke =
    highlight === "bad" ? "#ef4444" : highlight === "good" ? "#34d399" : "none";
  const glowFilter = highlight
    ? `drop-shadow(0 0 4px ${ringStroke})`
    : "none";

  const sidewaysTransform = sideways
    ? `translate(${outerW / 2},${outerH / 2}) rotate(90) translate(${-tileW / 2},${-tileH / 2})`
    : undefined;

  if (facedown) {
    return (
      <svg
        width={outerW}
        height={outerH}
        viewBox={`0 0 ${outerW} ${outerH}`}
        style={{ flexShrink: 0, opacity: dimmed ? 0.3 : 1, filter: glowFilter, display: "block" }}
      >
        <g transform={sidewaysTransform}>
          <rect x={0.5} y={0.5} width={tileW - 1} height={tileH - 1} rx={2.5} fill="#1B5E20" stroke="#2E7D32" strokeWidth={0.7} />
          <rect x={2.5} y={2.5} width={tileW - 5} height={tileH - 5} rx={1.5} fill="none" stroke="#388E3C" strokeWidth={0.4} opacity={0.4} />
        </g>
      </svg>
    );
  }

  if (!tile) return null;

  return (
    <svg
      width={outerW}
      height={outerH}
      viewBox={`0 0 ${outerW} ${outerH}`}
      style={{ flexShrink: 0, opacity: dimmed ? 0.3 : 1, filter: glowFilter, cursor: "default", display: "block" }}
    >
      <g transform={sidewaysTransform}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFF5" />
            <stop offset="50%" stopColor="#F5F0E6" />
            <stop offset="100%" stopColor="#E8E0D0" />
          </linearGradient>
        </defs>
        <rect
          x={0.5}
          y={0.5}
          width={tileW - 1}
          height={tileH - 1}
          rx={3}
          fill={`url(#${gradientId})`}
          stroke={highlight ? ringStroke : "#C8C0B0"}
          strokeWidth={highlight ? 1.8 : 0.7}
        />
        <rect x={1.5} y={1} width={tileW - 3} height={2.5} rx={1.5} fill="white" opacity={0.45} />
        <TileFace tile={tile} width={tileW} height={tileH} />
      </g>
    </svg>
  );
}
