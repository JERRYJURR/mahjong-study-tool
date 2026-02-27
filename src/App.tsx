import { useState } from "react";
import { MOCK_REPLAY, MOCK_MISTAKES } from "./data/mockData";
import Header from "./components/layout/Header";
import MistakeCard from "./components/analysis/MistakeCard";

export default function App() {
  const [openId, setOpenId] = useState<number | null>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const totalEvLoss = MOCK_MISTAKES.reduce((s, m) => s + m.evDiff, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "#e4e4e7",
        fontFamily: "'DM Sans',-apple-system,sans-serif",
      }}
    >
      <Header replay={MOCK_REPLAY} totalEvLoss={totalEvLoss} />

      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "8px 20px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#27272a",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Top 5 Biggest Mistakes
          </span>
          <span style={{ fontSize: 9, color: "#1f1f23" }}>By EV impact</span>
        </div>

        {MOCK_MISTAKES.map((m) => (
          <MistakeCard
            key={m.id}
            mistake={m}
            isOpen={openId === m.id}
            onToggle={() => setOpenId(openId === m.id ? null : m.id)}
          />
        ))}

        <button
          onClick={() => {
            setIsLoadingMore(true);
            setTimeout(() => setIsLoadingMore(false), 2500);
          }}
          disabled={isLoadingMore}
          style={{
            marginTop: 4,
            width: "100%",
            padding: 13,
            borderRadius: 11,
            border: "1px dashed #1a1a1d",
            background: "transparent",
            color: isLoadingMore ? "#27272a" : "#3f3f46",
            fontSize: 12,
            fontWeight: 600,
            cursor: isLoadingMore ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            fontFamily: "inherit",
          }}
        >
          {isLoadingMore ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  border: "2px solid #1f1f23",
                  borderTopColor: "#3f3f46",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Analyzing next 5...
            </>
          ) : (
            "+ Generate 5 More Insights"
          )}
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#141416" }}>Mortal AI &middot; Claude &middot; v0.5</p>
      </div>
    </div>
  );
}
