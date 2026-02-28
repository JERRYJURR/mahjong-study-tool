import { useRef, useState, useEffect, useCallback } from "react";
import type { Mistake } from "../../data/types";
import TableBoard from "../board/TableBoard";
import TileRow from "../tiles/TileRow";
import Tile from "../tiles/Tile";
import HandComparison from "../analysis/HandComparison";
import {
  TEXT_MUTED,
  TEXT_FAINT,
  BORDER_SUBTLE,
  FONT_LABEL,
} from "../../lib/designTokens";

interface BoardPanelProps {
  mistake: Mistake | null;
}

export default function BoardPanel({ mistake }: BoardPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [boardNaturalHeight, setBoardNaturalHeight] = useState(0);

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    const board = boardRef.current;
    if (!container || !board) return;

    // Reset scale to measure natural size
    board.style.transform = "scale(1)";
    board.style.transformOrigin = "top center";

    const containerWidth = container.clientWidth - 32; // padding
    const containerHeight = container.clientHeight * 0.65; // leave room for hand below
    const boardWidth = board.scrollWidth;
    const boardHeight = board.scrollHeight;

    if (boardWidth > 0 && boardHeight > 0) {
      const scaleW = containerWidth / boardWidth;
      const scaleH = containerHeight / boardHeight;
      const newScale = Math.min(scaleW, scaleH, 1.3);
      setScale(newScale);
      setBoardNaturalHeight(boardHeight);
    }
  }, []);

  useEffect(() => {
    if (!mistake) return;

    // Use ResizeObserver on the container
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updateScale();
    });
    observer.observe(container);

    // Initial measure after a frame
    requestAnimationFrame(updateScale);

    return () => observer.disconnect();
  }, [mistake, updateScale]);

  if (!mistake) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRight: `1px solid ${BORDER_SUBTLE}`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>
            {"\u{1FA24}"}
          </div>
          <div style={{ fontSize: 13, color: TEXT_MUTED }}>
            Select a mistake to view the board
          </div>
        </div>
      </div>
    );
  }

  const m = mistake;

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        padding: 16,
        borderRight: `1px solid ${BORDER_SUBTLE}`,
      }}
    >
      {/* Scaled board — wrapper has explicit height to account for transform */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 16,
          height: boardNaturalHeight > 0 ? boardNaturalHeight * scale : "auto",
          flexShrink: 0,
        }}
      >
        <div
          ref={boardRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <TableBoard data={m.boardState} size="large" />
        </div>
      </div>

      {/* Your hand */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: FONT_LABEL,
            color: TEXT_MUTED,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          Your Hand
        </div>
        <TileRow tiles={m.hand} size="md" />
        {m.drew && (
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: FONT_LABEL, color: TEXT_FAINT }}>
              Drew:
            </span>
            <Tile tile={m.drew} size="md" />
          </div>
        )}
      </div>

      {/* Hand comparison */}
      <HandComparison
        yourDiscard={m.yourDiscard}
        optimalDiscard={m.optimalDiscard}
      />
    </div>
  );
}
