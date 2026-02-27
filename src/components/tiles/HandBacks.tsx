import type { TileSize } from "../../data/types";
import Tile from "./Tile";

interface HandBacksProps {
  count: number;
  size?: TileSize;
  /** Pixel overlap between tiles (0 = no overlap). Tiles stack left-to-right. */
  overlap?: number;
}

export default function HandBacks({ count, size = "xs", overlap = 0 }: HandBacksProps) {
  return (
    <div style={{ display: "flex" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -overlap }}>
          <Tile facedown size={size} />
        </div>
      ))}
    </div>
  );
}
