import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../../data/types";
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  BORDER_DEFAULT,
  BORDER_SUBTLE,
  BORDER_HOVER,
  FONT_LABEL,
  FONT_BODY,
} from "../../lib/designTokens";

interface MistakeChatProps {
  mistakeId: number;
}

const MOCK_RESPONSES = [
  "Good question. Your discard left 6 useful tile types (~12 remaining), while the optimal play keeps 9 types (~18 tiles). That compounds over remaining draws.",
  "Think of it this way \u2014 each early discard isn't just about this turn, it's about which future hands you keep alive. The connected shape branches into multiple winning paths.",
  "Exactly. These small efficiency leaks are invisible in the moment. But 2-3 per game \u00D7 100 games = the difference between climbing and stalling.",
];

export default function MistakeChat({ mistakeId }: MistakeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    setMessages((p) => [...p, { role: "user", text: input.trim() }]);
    setInput("");
    setIsThinking(true);
    setTimeout(() => {
      setMessages((p) => {
        const idx = p.filter((m) => m.role === "assistant").length % MOCK_RESPONSES.length;
        return [...p, { role: "assistant", text: MOCK_RESPONSES[idx] }];
      });
      setIsThinking(false);
    }, 1200);
  };

  void mistakeId;

  return (
    <div style={{ background: "#0a0a0c", borderRadius: 10, border: `1px solid ${BORDER_DEFAULT}`, overflow: "hidden" }}>
      <div style={{ padding: "7px 12px", borderBottom: `1px solid ${BORDER_SUBTLE}`, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: FONT_LABEL }}>{"\u{1F4AC}"}</span>
        <span style={{ fontSize: FONT_LABEL, color: TEXT_MUTED, fontWeight: 600 }}>Ask about this mistake</span>
      </div>

      {messages.length > 0 && (
        <div
          ref={chatRef}
          style={{
            maxHeight: 200,
            overflowY: "auto",
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "85%",
                  padding: "7px 11px",
                  borderRadius: msg.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  background: msg.role === "user" ? "#164e63" : "#141416",
                  color: msg.role === "user" ? "#cffafe" : "#d4d4d8",
                  fontSize: FONT_BODY,
                  lineHeight: 1.55,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div
              style={{
                padding: "7px 11px",
                borderRadius: "10px 10px 10px 2px",
                background: "#141416",
                color: TEXT_MUTED,
                fontSize: FONT_BODY,
                alignSelf: "flex-start",
              }}
            >
              Thinking...
            </div>
          )}
        </div>
      )}

      <div
        style={{
          padding: "7px 8px",
          borderTop: messages.length ? `1px solid ${BORDER_SUBTLE}` : "none",
          display: "flex",
          gap: 6,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Why is this tile safer? What about..."
          style={{
            flex: 1,
            background: "#141416",
            border: `1px solid ${BORDER_HOVER}`,
            borderRadius: 7,
            padding: "7px 10px",
            color: TEXT_PRIMARY,
            fontSize: FONT_BODY,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          style={{
            background: input.trim() && !isThinking ? "#0e7490" : BORDER_DEFAULT,
            color: input.trim() && !isThinking ? "#cffafe" : TEXT_MUTED,
            border: "none",
            borderRadius: 7,
            padding: "7px 14px",
            fontSize: FONT_LABEL,
            fontWeight: 600,
            cursor: input.trim() && !isThinking ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
