import { useState, useRef, useEffect } from "react";
import type { Mistake } from "../../data/types";
import type { GenerationStatus } from "../analysis/GeneratePanel";
import { evColor, CATEGORY_ICONS } from "../../lib/utils";
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  TEXT_FAINT,
  TEXT_SECONDARY,
  ACCENT_CYAN,
  BG_CARD,
  BG_APP,
  BORDER_SUBTLE,
  BORDER_DEFAULT,
  BORDER_HOVER,
  FONT_LABEL,
  FONT_BODY,
  FONT_MONO,
} from "../../lib/designTokens";

interface InsightNavBarProps {
  mistakes: Mistake[];
  selectedIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (id: number) => void;
  genStatus: GenerationStatus;
  genProgress: number;
  genError: string | null;
  onGenerate: () => void;
}

export default function InsightNavBar({
  mistakes,
  selectedIndex,
  onPrev,
  onNext,
  onSelect,
  genStatus,
  genProgress,
  onGenerate,
}: InsightNavBarProps) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const current = mistakes[selectedIndex] ?? null;
  const isFirst = selectedIndex <= 0;
  const isLast = selectedIndex >= mistakes.length - 1;

  // Close popup on click outside (excluding the toggle area)
  useEffect(() => {
    if (!showPopup) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popupRef.current && !popupRef.current.contains(target) &&
        toggleRef.current && !toggleRef.current.contains(target)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPopup]);

  const ghostBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 6,
    border: `1px solid ${disabled ? BORDER_SUBTLE : BORDER_DEFAULT}`,
    background: disabled ? "transparent" : BG_CARD,
    color: disabled ? TEXT_FAINT : TEXT_PRIMARY,
    fontSize: FONT_BODY,
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  });

  const nextBtnStyle: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: 6,
    border: "none",
    background: isLast
      ? BORDER_SUBTLE
      : `linear-gradient(135deg, ${ACCENT_CYAN}, #06b6d4)`,
    color: isLast ? TEXT_FAINT : "#09090b",
    fontSize: FONT_BODY,
    fontWeight: 700,
    cursor: isLast ? "default" : "pointer",
    opacity: isLast ? 0.4 : 1,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Popup */}
      {showPopup && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            bottom: "100%",
            left: 16,
            right: 16,
            maxHeight: 360,
            display: "flex",
            flexDirection: "column",
            background: BG_CARD,
            border: `1px solid ${BORDER_DEFAULT}`,
            borderRadius: 10,
            boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
            marginBottom: 4,
            overflow: "hidden",
          }}
        >
          {/* Scrollable list */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "6px 0",
            }}
          >
            {mistakes.map((m, i) => {
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelect(m.id);
                    setShowPopup(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 14px",
                    border: "none",
                    borderLeft: isSelected
                      ? `3px solid ${ACCENT_CYAN}`
                      : "3px solid transparent",
                    background: isSelected
                      ? "rgba(34,211,238,0.08)"
                      : "transparent",
                    color: TEXT_PRIMARY,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: FONT_BODY,
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = `rgba(255,255,255,0.03)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected
                      ? "rgba(34,211,238,0.08)"
                      : "transparent";
                  }}
                >
                  {/* Category icon */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: BORDER_DEFAULT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {CATEGORY_ICONS[m.category] ?? "\u2753"}
                  </div>

                  {/* Round + turn */}
                  <span
                    style={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.round}{" "}
                    <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>
                      T{m.turn}
                    </span>
                  </span>

                  {/* Category */}
                  <span
                    style={{
                      fontSize: FONT_LABEL,
                      color: TEXT_FAINT,
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {m.category}
                  </span>

                  {/* EV diff */}
                  <span
                    style={{
                      fontSize: FONT_BODY,
                      fontWeight: 800,
                      fontFamily: FONT_MONO,
                      color: evColor(m.evDiff),
                      letterSpacing: "-0.02em",
                      flexShrink: 0,
                    }}
                  >
                    {m.evDiff.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer: Analyze more button */}
          <div
            style={{
              padding: "8px 14px",
              borderTop: `1px solid ${BORDER_SUBTLE}`,
            }}
          >
            <button
              onClick={() => {
                onGenerate();
                setShowPopup(false);
              }}
              style={{
                width: "100%",
                padding: "8px 0",
                borderRadius: 6,
                border: `1px solid ${BORDER_HOVER}`,
                background: "transparent",
                color: TEXT_SECONDARY,
                fontSize: FONT_BODY,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Analyze 5 More Insights
            </button>
          </div>
        </div>
      )}

      {/* Nav bar */}
      <div
        style={{
          height: 48,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          borderTop: `1px solid ${BORDER_SUBTLE}`,
          background: BG_CARD,
        }}
      >
        {/* Left: Previous button (ghost style) */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          style={ghostBtnStyle(isFirst)}
        >
          {"\u2190"} Prev
        </button>

        {/* Center: clickable current insight summary or generation progress */}
        <div
          ref={toggleRef}
          onClick={() => setShowPopup((p) => !p)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            minWidth: 0,
            cursor: "pointer",
            borderRadius: 6,
            padding: "4px 8px",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `rgba(255,255,255,0.04)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {genStatus === "generating" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  border: `2px solid ${BORDER_DEFAULT}`,
                  borderTopColor: ACCENT_CYAN,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: FONT_BODY, color: TEXT_MUTED }}>
                Generating {genProgress + 1}/{mistakes.length}...
              </span>
            </div>
          ) : current ? (
            <>
              {/* Category icon */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: BORDER_DEFAULT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  flexShrink: 0,
                }}
              >
                {CATEGORY_ICONS[current.category] ?? "\u2753"}
              </div>

              {/* Round + turn */}
              <span
                style={{
                  fontSize: FONT_BODY,
                  fontWeight: 600,
                  color: TEXT_PRIMARY,
                  whiteSpace: "nowrap",
                }}
              >
                {current.round}{" "}
                <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>
                  T{current.turn}
                </span>
              </span>

              {/* Separator */}
              <span style={{ color: TEXT_FAINT, fontSize: FONT_LABEL }}>
                {"\u00B7"}
              </span>

              {/* Category */}
              <span
                style={{
                  fontSize: FONT_LABEL,
                  color: TEXT_FAINT,
                  whiteSpace: "nowrap",
                }}
              >
                {current.category}
              </span>

              {/* EV diff badge */}
              <span
                style={{
                  fontSize: FONT_BODY,
                  fontWeight: 800,
                  fontFamily: FONT_MONO,
                  color: evColor(current.evDiff),
                  letterSpacing: "-0.02em",
                }}
              >
                {current.evDiff.toFixed(2)}
              </span>

              {/* Chevron indicator */}
              <span
                style={{
                  fontSize: 10,
                  color: TEXT_FAINT,
                  marginLeft: 2,
                }}
              >
                {showPopup ? "\u25BC" : "\u25B2"}
              </span>
            </>
          ) : null}
        </div>

        {/* Right: counter + Next button (cyan CTA) */}
        <span
          style={{
            fontSize: FONT_LABEL,
            color: TEXT_MUTED,
            fontFamily: FONT_MONO,
            whiteSpace: "nowrap",
          }}
        >
          {mistakes.length > 0
            ? `${selectedIndex + 1} / ${mistakes.length}`
            : ""}
        </span>

        <button
          onClick={onNext}
          disabled={isLast}
          style={nextBtnStyle}
        >
          Next {"\u2192"}
        </button>
      </div>
    </div>
  );
}
