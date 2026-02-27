import type { TileSize } from "../../data/types";
import Tile from "./Tile";

interface HandBacksProps {
  count: number;
  size?: TileSize;
}

export default function HandBacks({ count, size = "xs" }: HandBacksProps) {
  return (
    <div style={{ display: "flex", gap: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Tile key={i} facedown size={size} />
      ))}
    </div>
  );
}
