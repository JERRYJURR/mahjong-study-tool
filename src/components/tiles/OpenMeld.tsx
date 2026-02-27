import type { Meld, TileSize } from "../../data/types";
import Tile from "./Tile";

interface OpenMeldProps {
  meld: Meld;
  size?: TileSize;
}

export default function OpenMeld({ meld, size = "xs" }: OpenMeldProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        padding: "1px 2px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {meld.tiles.map((t, i) => (
        <Tile
          key={`${t}-${i}`}
          tile={t}
          size={size}
          sideways={i === meld.calledFrom}
        />
      ))}
    </div>
  );
}
