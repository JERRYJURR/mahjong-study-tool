import type { TileSize, TileNotation, HighlightType } from "../../data/types";
import { TILE_SIZES, tileSvgPath } from "../../lib/tileMap";

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
  const s = TILE_SIZES[size];
  const tileW = s.w;
  const tileH = s.h;
  const outerW = sideways ? tileH : tileW;
  const outerH = sideways ? tileW : tileH;

  const highlightColor =
    highlight === "bad" ? "#ef4444" : highlight === "good" ? "#34d399" : null;

  const src = facedown ? tileSvgPath("back") : tile ? tileSvgPath(tile) : null;
  if (!src) return null;

  const containerStyle: React.CSSProperties = {
    width: outerW,
    height: outerH,
    flexShrink: 0,
    opacity: dimmed ? 0.3 : 1,
    display: "inline-block",
    position: "relative",
  };

  // Highlight: glow filter on the container
  if (highlightColor) {
    containerStyle.filter = `drop-shadow(0 0 4px ${highlightColor})`;
  }

  const imgStyle: React.CSSProperties = {
    width: tileW,
    height: tileH,
    display: "block",
  };

  if (sideways) {
    // For sideways tiles: position the img centered and rotate
    imgStyle.position = "absolute";
    imgStyle.top = "50%";
    imgStyle.left = "50%";
    imgStyle.transform = "translate(-50%, -50%) rotate(90deg)";
  }

  return (
    <div style={containerStyle}>
      <img
        src={src}
        alt={facedown ? "back" : tile ?? ""}
        style={imgStyle}
        draggable={false}
      />
    </div>
  );
}
