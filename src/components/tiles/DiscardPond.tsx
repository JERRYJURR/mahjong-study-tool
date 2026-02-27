import type { TileNotation, TileSize } from "../../data/types";
import Tile from "./Tile";

interface DiscardPondProps {
  discards: TileNotation[];
  size?: TileSize;
  riichiTurnIndex?: number;
  cols?: number;
}

export default function DiscardPond({
  discards,
  size = "xs",
  riichiTurnIndex = -1,
  cols = 6,
}: DiscardPondProps) {
  const rows: TileNotation[][] = [];
  for (let i = 0; i < discards.length; i += cols) {
    rows.push(discards.slice(i, i + cols));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 0 }}>
          {row.map((t, ci) => {
            const idx = ri * cols + ci;
            return (
              <Tile
                key={`${t}-${idx}`}
                tile={t}
                size={size}
                sideways={idx === riichiTurnIndex}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
