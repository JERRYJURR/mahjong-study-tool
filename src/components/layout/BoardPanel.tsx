import { useRef, useState, useEffect, useCallback } from "react";
import type { Mistake } from "../../data/types";
import TableBoard from "../board/TableBoard";
import {
  TEXT_MUTED,
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

    // Reset to measure natural size
    board.style.transform = "scale(1)";
    board.style.transformOrigin = "top center";

    const containerWidth = container.clientWidth - 24; // account for padding
    const boardWidth = board.scrollWidth;
    const boardHeight = board.scrollHeight;

    if (boardWidth > 0) {
      // Scale to fill the full width, height follows proportionally
      const newScale = containerWidth / boardWidth;
      setScale(newScale);
      setBoardNaturalHeight(boardHeight);
    }
  }, []);

  useEffect(() => {
    if (!mistake) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => updateScale());
    observer.observe(container);
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
        overflowY: "auto",
        overflowX: "hidden",
        padding: 12,
      }}
    >
      {/* Board — scales to fill full width, height follows proportionally */}
      <div
        style={{
          height: boardNaturalHeight > 0 ? boardNaturalHeight * scale : "auto",
          flexShrink: 0,
        }}
      >
        <div
          ref={boardRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <TableBoard data={m.boardState} size="large" />
        </div>
      </div>
    </div>
  );
}
