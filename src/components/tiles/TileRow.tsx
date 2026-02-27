import type { TileNotation, TileSize, HighlightType } from "../../data/types";
import Tile from "./Tile";

interface TileRowProps {
  tiles: TileNotation[];
  size?: TileSize;
  highlightTile?: TileNotation;
  highlightType?: HighlightType;
  gap?: number;
}

export default function TileRow({
  tiles,
  size = "md",
  highlightTile,
  highlightType,
  gap = 1,
}: TileRowProps) {
  return (
    <div style={{ display: "flex", gap, flexWrap: "wrap", alignItems: "flex-end" }}>
      {tiles.map((t, i) => (
        <Tile
          key={`${t}-${i}`}
          tile={t}
          size={size}
          highlight={t === highlightTile ? highlightType : null}
        />
      ))}
    </div>
  );
}
