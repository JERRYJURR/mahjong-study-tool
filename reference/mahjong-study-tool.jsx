import { useState, useRef, useEffect } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   INLINE SVG TILE SYSTEM
   ══════════════════════════════════════════════════════════════════════════ */

const PIN_LAYOUTS = {
  1: [[14,19]],
  2: [[14,11],[14,27]],
  3: [[14,9],[14,19],[14,29]],
  4: [[8,11],[20,11],[8,27],[20,27]],
  5: [[8,10],[20,10],[14,19],[8,28],[20,28]],
  6: [[8,9],[20,9],[8,19],[20,19],[8,29],[20,29]],
  7: [[8,8],[20,8],[8,17],[20,17],[14,24],[8,31],[20,31]],
  8: [[8,7],[20,7],[8,15],[20,15],[8,23],[20,23],[8,31],[20,31]],
  9: [[7,7],[14,7],[21,7],[7,17],[14,17],[21,17],[7,27],[14,27],[21,27]],
};

const SOU_LAYOUTS = {
  1: "bird",
  2: [[10,18]],
  3: [[7,14,21]],
  4: [[7,12,16,21]],
  5: [[6,10,14,18,22]],
  6: [[6,10,14,18,22,26]],
  7: [[5,9,12,15,18,21,25]],
  8: [[5,8,11,14,17,20,23,26]],
  9: [[4,7,10,13,16,19,22,25,28]],
};

const MAN_KANJI = {1:"一",2:"二",3:"三",4:"四",5:"五",6:"六",7:"七",8:"八",9:"九"};

const HONOR_DATA = {
  "1z": { char:"東", color:"#1565C0" },
  "2z": { char:"南", color:"#1565C0" },
  "3z": { char:"西", color:"#1565C0" },
  "4z": { char:"北", color:"#1565C0" },
  "5z": { char:"白", color:"#999", special:"haku" },
  "6z": { char:"發", color:"#2E7D32" },
  "7z": { char:"中", color:"#C62828" },
};

function TileFace({ tile, width, height }) {
  const suit = tile.slice(-1);
  const num = parseInt(tile.slice(0,-1));
  const fW = width * 0.7;
  const oX = width * 0.15;
  const oY = height * 0.08;

  if (suit === "p") {
    const dots = PIN_LAYOUTS[num] || [];
    const sc = fW / 28;
    return (
      <g>
        {dots.map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={oX + cx*sc} cy={oY + cy*sc} r={3.2*sc} fill="none" stroke="#C62828" strokeWidth={1.2*sc} />
            <circle cx={oX + cx*sc} cy={oY + cy*sc} r={1.5*sc} fill="#C62828" />
          </g>
        ))}
      </g>
    );
  }

  if (suit === "s") {
    if (num === 1) {
      const cx = width/2, cy = height/2;
      return (
        <g>
          <ellipse cx={cx} cy={cy-2} rx={width*0.18} ry={height*0.22} fill="#2E7D32" opacity={0.15} />
          <line x1={cx} y1={cy-height*0.28} x2={cx} y2={cy+height*0.28} stroke="#2E7D32" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy-height*0.12} r={width*0.12} fill="#2E7D32" opacity={0.85} />
          <circle cx={cx-width*0.04} cy={cy-height*0.14} r={1} fill="white" />
          <path d={`M${cx} ${cy+2} Q${cx+8} ${cy-4} ${cx+3} ${cy-8}`} fill="none" stroke="#2E7D32" strokeWidth={1.5} />
          <path d={`M${cx} ${cy+2} Q${cx-8} ${cy-4} ${cx-3} ${cy-8}`} fill="none" stroke="#2E7D32" strokeWidth={1.5} />
        </g>
      );
    }
    const xs = SOU_LAYOUTS[num];
    if (!xs || xs === "bird") return null;
    const arr = xs[0] || xs;
    const sc = fW / 28;
    const topY = oY + 3, botY = oY + height*0.78 - 3, midY = (topY+botY)/2;
    return (
      <g>
        {arr.map((cx, i) => (
          <g key={i}>
            <line x1={oX+cx*sc} y1={topY} x2={oX+cx*sc} y2={midY-1} stroke="#2E7D32" strokeWidth={2.2*sc} strokeLinecap="round" />
            <line x1={oX+cx*sc} y1={midY+1} x2={oX+cx*sc} y2={botY} stroke="#2E7D32" strokeWidth={2.2*sc} strokeLinecap="round" />
            <circle cx={oX+cx*sc} cy={midY} r={1.2*sc} fill="#66BB6A" />
          </g>
        ))}
      </g>
    );
  }

  if (suit === "m") {
    return (
      <g>
        <text x={width/2} y={height*0.42} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize:height*0.36, fontWeight:800, fill:"#C62828", fontFamily:"'Noto Serif','Hiragino Mincho Pro',serif" }}>
          {MAN_KANJI[num]}
        </text>
        <text x={width/2} y={height*0.74} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize:height*0.22, fontWeight:700, fill:"#C62828", fontFamily:"'Noto Serif','Hiragino Mincho Pro',serif", opacity:0.7 }}>
          萬
        </text>
      </g>
    );
  }

  if (suit === "z") {
    const h = HONOR_DATA[tile];
    if (!h) return null;
    if (h.special === "haku") {
      return <rect x={width*0.22} y={height*0.18} width={width*0.56} height={height*0.64} rx={2} fill="none" stroke="#1565C0" strokeWidth={2} opacity={0.4} />;
    }
    return (
      <text x={width/2} y={height*0.52} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize:height*0.48, fontWeight:900, fill:h.color, fontFamily:"'Noto Serif','Hiragino Mincho Pro',serif" }}>
        {h.char}
      </text>
    );
  }
  return null;
}

const SIZES = {
  xxs: { w: 22, h: 30 },
  xs: { w: 28, h: 38 },
  sm: { w: 36, h: 49 },
  md: { w: 44, h: 60 },
  lg: { w: 52, h: 71 },
};

function Tile({ tile, highlight, dimmed, size="md", facedown, sideways }) {
  const s = SIZES[size];
  const tileW = s.w, tileH = s.h;
  const outerW = sideways ? tileH : tileW;
  const outerH = sideways ? tileW : tileH;
  const ringStroke = highlight === "bad" ? "#ef4444" : highlight === "good" ? "#34d399" : "none";
  const glowFilter = highlight ? `drop-shadow(0 0 4px ${ringStroke})` : "none";

  if (facedown) {
    return (
      <svg width={outerW} height={outerH} viewBox={`0 0 ${outerW} ${outerH}`}
        style={{ flexShrink:0, opacity:dimmed?0.3:1, filter:glowFilter, display:"block" }}>
        <g transform={sideways ? `translate(${outerW/2},${outerH/2}) rotate(90) translate(${-tileW/2},${-tileH/2})` : undefined}>
          <rect x={0.5} y={0.5} width={tileW-1} height={tileH-1} rx={2.5} fill="#1B5E20" stroke="#2E7D32" strokeWidth={0.7} />
          <rect x={2.5} y={2.5} width={tileW-5} height={tileH-5} rx={1.5} fill="none" stroke="#388E3C" strokeWidth={0.4} opacity={0.4} />
        </g>
      </svg>
    );
  }

  const gid = `tg-${tile}-${size}-${Math.random().toString(36).slice(2,6)}`;
  return (
    <svg width={outerW} height={outerH} viewBox={`0 0 ${outerW} ${outerH}`}
      style={{ flexShrink:0, opacity:dimmed?0.3:1, filter:glowFilter, cursor:"default", display:"block" }}>
      <g transform={sideways ? `translate(${outerW/2},${outerH/2}) rotate(90) translate(${-tileW/2},${-tileH/2})` : undefined}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFF5" />
            <stop offset="50%" stopColor="#F5F0E6" />
            <stop offset="100%" stopColor="#E8E0D0" />
          </linearGradient>
        </defs>
        <rect x={0.5} y={0.5} width={tileW-1} height={tileH-1} rx={3}
          fill={`url(#${gid})`} stroke={highlight ? ringStroke : "#C8C0B0"} strokeWidth={highlight ? 1.8 : 0.7} />
        <rect x={1.5} y={1} width={tileW-3} height={2.5} rx={1.5} fill="white" opacity={0.45} />
        <TileFace tile={tile} width={tileW} height={tileH} />
      </g>
    </svg>
  );
}

function TileRow({ tiles, size="md", highlightTile, highlightType, gap=1 }) {
  return (
    <div style={{ display:"flex", gap, flexWrap:"wrap", alignItems:"flex-end" }}>
      {tiles.map((t,i) => <Tile key={`${t}-${i}`} tile={t} size={size} highlight={t===highlightTile ? highlightType : null} />)}
    </div>
  );
}

/* ═══════════════════════ DISCARD POND ═══════════════════════ */

function DiscardPond({ discards, size="xs", riichiTurnIndex=-1, cols=6 }) {
  const rows = [];
  for (let i=0; i<discards.length; i+=cols) rows.push(discards.slice(i,i+cols));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {rows.map((row,ri) => (
        <div key={ri} style={{ display:"flex", gap:0 }}>
          {row.map((t,ci) => {
            const idx = ri*cols+ci;
            return <Tile key={`${t}-${idx}`} tile={t} size={size} sideways={idx===riichiTurnIndex} />;
          })}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════ OPEN MELD ═══════════════════════ */

function OpenMeld({ meld, size="xs" }) {
  return (
    <div style={{ display:"flex", gap:0, padding:"1px 2px", background:"rgba(255,255,255,0.03)", borderRadius:2, border:"1px solid rgba(255,255,255,0.05)" }}>
      {meld.tiles.map((t,i) => <Tile key={`${t}-${i}`} tile={t} size={size} sideways={i===meld.calledFrom} />)}
    </div>
  );
}

/* ═══════════════════════ HAND BACKS ═══════════════════════ */

function HandBacks({ count, size="xs" }) {
  return (
    <div style={{ display:"flex", gap:0 }}>
      {Array.from({length:count}).map((_,i) => <Tile key={i} facedown size={size} />)}
    </div>
  );
}

/* ═══════════════════════ SEAT BADGE ═══════════════════════ */

function SeatBadge({ label, seat, score, isRiichi, isDealer, isYou, compact }) {
  if (compact) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:3 }}>
        <span style={{ fontSize:8, fontWeight:700, color: isYou?"#22d3ee":isRiichi?"#f87171":"#52525b" }}>{label}</span>
        {isDealer && <span style={{ fontSize:7, color:"#fbbf24" }}>親</span>}
        {isRiichi && <span style={{ fontSize:7, color:"#f87171" }}>⚡</span>}
        <span style={{ fontSize:7, color:"#3f3f46", fontFamily:"'JetBrains Mono',monospace" }}>{(score??0).toLocaleString()}</span>
      </div>
    );
  }
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
      <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", color: isYou?"#22d3ee":isRiichi?"#f87171":"#71717a" }}>{label}</span>
      <span style={{ fontSize:9, color:"#3f3f46" }}>{seat}</span>
      {isDealer && <span style={{ fontSize:8, color:"#fbbf24", background:"#292524", padding:"1px 4px", borderRadius:3 }}>親</span>}
      {isRiichi && <span style={{ fontSize:8, color:"#f87171", background:"#1c1017", padding:"1px 4px", borderRadius:3, border:"1px solid rgba(239,68,68,0.2)" }}>⚡立直</span>}
      <span style={{ fontSize:9, color:"#52525b", fontFamily:"'JetBrains Mono',monospace" }}>{(score??0).toLocaleString()}</span>
    </div>
  );
}

/* ═══════════════════════ TABLE BOARD ═══════════════════════ */

function TableBoard({ data }) {
  const { you, kamicha, toimen, shimocha, dora, roundWind, turnNumber, honba } = data;

  /* Opponent hand strip: melds + backs */
  const OpponentHand = ({ player, size="xs" }) => (
    <div style={{ display:"flex", alignItems:"center", gap:2 }}>
      {player.openMelds?.map((m,i) => <OpenMeld key={i} meld={m} size={size} />)}
      <HandBacks count={player.closedHandCount||13} size={size} />
    </div>
  );

  return (
    <div style={{ background:"#0c0c0f", borderRadius:12, border:"1px solid #1a1a1d", padding:14, overflow:"hidden" }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:9, color:"#3f3f46", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Table</span>
          <span style={{ fontSize:9, color:"#27272a" }}>
            {data.round||`${roundWind} ${turnNumber}`}{honba?` · ${honba}本`:""}
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <span style={{ fontSize:9, color:"#3f3f46" }}>Dora</span>
          <Tile tile={dora} size="sm" />
        </div>
      </div>

      {/* ─── MAIN TABLE GRID ─── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"auto 1fr auto",
        gridTemplateRows:"auto 1fr auto",
        gridTemplateAreas:`
          ".         toimen     ."
          "kamicha   center     shimocha"
          ".         you        ."
        `,
        gap:6,
        alignItems:"center",
        justifyItems:"center",
      }}>

        {/* ─ TOIMEN (top): badge + hand at far edge ─ */}
        <div style={{ gridArea:"toimen", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <SeatBadge label="Toimen" seat={toimen.seat} score={toimen.score}
            isRiichi={toimen.isRiichi} isDealer={toimen.isDealer} compact />
          <div style={{ transform:"rotate(180deg)" }}>
            <OpponentHand player={toimen} />
          </div>
        </div>

        {/* ─ KAMICHA (left): badge + hand at left edge, vertical ─ */}
        <div style={{
          gridArea:"kamicha",
          display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          transform:"rotate(90deg)", transformOrigin:"center center",
        }}>
          <SeatBadge label="Kami" seat={kamicha.seat} score={kamicha.score}
            isRiichi={kamicha.isRiichi} isDealer={kamicha.isDealer} compact />
          <OpponentHand player={kamicha} />
        </div>

        {/* ═══ CENTER POND: all 4 discard zones ═══ */}
        <div style={{
          gridArea:"center",
          display:"grid",
          gridTemplateColumns:"auto 1fr auto",
          gridTemplateRows:"auto 1fr auto",
          gridTemplateAreas:`
            ".          tDiscards   ."
            "kDiscards  wind        sDiscards"
            ".          yDiscards   ."
          `,
          gap:6,
          alignItems:"center",
          justifyItems:"center",
          padding:6,
          background:"rgba(255,255,255,0.01)",
          borderRadius:8,
          border:"1px solid #141416",
          minWidth: 240,
        }}>
          {/* Toimen discards (top, rotated 180°) */}
          <div style={{ gridArea:"tDiscards", transform:"rotate(180deg)" }}>
            <DiscardPond discards={toimen.discards} size="xs" riichiTurnIndex={toimen.riichiTurnIndex} />
          </div>

          {/* Kamicha discards (left, rotated 90°) */}
          <div style={{ gridArea:"kDiscards", transform:"rotate(90deg)", transformOrigin:"center center" }}>
            <DiscardPond discards={kamicha.discards} size="xs" riichiTurnIndex={kamicha.riichiTurnIndex} cols={4} />
          </div>

          {/* Wind indicator */}
          <div style={{
            gridArea:"wind",
            width:52, height:52, borderRadius:8,
            background:"linear-gradient(135deg,#18181b 0%,#0f0f12 100%)",
            border:"1px solid #1f1f23",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1,
          }}>
            <span style={{ fontSize:18, fontWeight:800, color:"#3f3f46", fontFamily:"'Noto Serif',serif" }}>
              {roundWind==="East"?"東":roundWind==="South"?"南":"西"}
            </span>
            <span style={{ fontSize:8, color:"#27272a", textTransform:"uppercase", letterSpacing:"0.1em" }}>T{turnNumber}</span>
          </div>

          {/* Shimocha discards (right, rotated -90°) */}
          <div style={{ gridArea:"sDiscards", transform:"rotate(-90deg)", transformOrigin:"center center" }}>
            <DiscardPond discards={shimocha.discards} size="xs" riichiTurnIndex={shimocha.riichiTurnIndex} cols={4} />
          </div>

          {/* Your discards (bottom, normal) */}
          <div style={{ gridArea:"yDiscards" }}>
            <DiscardPond discards={you.discards} size="xs" riichiTurnIndex={you.riichiTurnIndex} />
          </div>
        </div>

        {/* ─ SHIMOCHA (right): badge + hand at right edge, vertical ─ */}
        <div style={{
          gridArea:"shimocha",
          display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          transform:"rotate(-90deg)", transformOrigin:"center center",
        }}>
          <SeatBadge label="Shimo" seat={shimocha.seat} score={shimocha.score}
            isRiichi={shimocha.isRiichi} isDealer={shimocha.isDealer} compact />
          <OpponentHand player={shimocha} />
        </div>

        {/* ─ YOU (bottom): discards in center above, hand + melds here ─ */}
        <div style={{ gridArea:"you", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          {you.openMelds?.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              {you.openMelds.map((m,i) => <OpenMeld key={i} meld={m} size="xs" />)}
            </div>
          )}
          <SeatBadge label="You" seat={you.seat} score={you.score} isYou
            isRiichi={you.isRiichi} isDealer={you.isDealer} compact />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ IMPACT PANEL ═══════════════════════ */

function ImpactPanel({ impact }) {
  if (!impact) return null;
  const styles = {
    dealt_in: { bg:"rgba(239,68,68,0.06)", border:"rgba(239,68,68,0.18)", icon:"💥" },
    missed_win: { bg:"rgba(251,191,36,0.06)", border:"rgba(251,191,36,0.18)", icon:"😤" },
    position_loss: { bg:"rgba(251,146,60,0.06)", border:"rgba(251,146,60,0.18)", icon:"📉" },
    no_direct: { bg:"rgba(161,161,170,0.04)", border:"rgba(161,161,170,0.1)", icon:"↗️" },
  };
  const c = styles[impact.type]||styles.no_direct;
  return (
    <div style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:10, padding:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
        <span style={{ fontSize:14 }}>{c.icon}</span>
        <span style={{ fontSize:10, fontWeight:700, color:"#d4d4d8", textTransform:"uppercase", letterSpacing:"0.05em" }}>What Actually Happened</span>
      </div>
      <p style={{ fontSize:13, color:"#a1a1aa", lineHeight:1.6, margin:0 }}>{impact.description}</p>
      {impact.pointSwing && (
        <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
          {[
            { label:"Actual", value:impact.pointSwing.actual, color:impact.pointSwing.actual.startsWith("-")?"#f87171":"#4ade80" },
            { label:"If Optimal", value:impact.pointSwing.optimal, color:"#4ade80" },
            { label:"Δ", value:impact.pointSwing.diff, color:"#fbbf24" },
          ].map((item,i) => (
            <div key={i} style={{ background:"#0a0a0c", borderRadius:6, padding:"5px 12px", border:"1px solid #1a1a1d" }}>
              <div style={{ fontSize:8, color:"#3f3f46", textTransform:"uppercase", letterSpacing:"0.06em" }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:800, color:item.color, fontFamily:"'JetBrains Mono',monospace" }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ CHAT ═══════════════════════ */

function MistakeChat({ mistakeId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatRef = useRef(null);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const mockResponses = [
    "Good question. Your discard left 6 useful tile types (~12 remaining), while the optimal play keeps 9 types (~18 tiles). That compounds over remaining draws.",
    "Think of it this way — each early discard isn't just about this turn, it's about which future hands you keep alive. The connected shape branches into multiple winning paths.",
    "Exactly. These small efficiency leaks are invisible in the moment. But 2-3 per game × 100 games = the difference between climbing and stalling.",
  ];

  const handleSend = () => {
    if (!input.trim()||isThinking) return;
    setMessages(p => [...p, { role:"user", text:input.trim() }]);
    setInput("");
    setIsThinking(true);
    setTimeout(() => {
      const idx = messages.filter(m=>m.role==="assistant").length % mockResponses.length;
      setMessages(p => [...p, { role:"assistant", text:mockResponses[idx] }]);
      setIsThinking(false);
    }, 1200);
  };

  return (
    <div style={{ background:"#0a0a0c", borderRadius:10, border:"1px solid #1a1a1d", overflow:"hidden" }}>
      <div style={{ padding:"7px 12px", borderBottom:"1px solid #141416", display:"flex", alignItems:"center", gap:5 }}>
        <span style={{ fontSize:11 }}>💬</span>
        <span style={{ fontSize:10, color:"#52525b", fontWeight:600 }}>Ask about this mistake</span>
      </div>
      {messages.length > 0 && (
        <div ref={chatRef} style={{ maxHeight:200, overflowY:"auto", padding:"8px 12px", display:"flex", flexDirection:"column", gap:8 }}>
          {messages.map((msg,i) => (
            <div key={i} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
              <div style={{
                maxWidth:"85%", padding:"7px 11px",
                borderRadius:msg.role==="user"?"10px 10px 2px 10px":"10px 10px 10px 2px",
                background:msg.role==="user"?"#164e63":"#141416",
                color:msg.role==="user"?"#cffafe":"#d4d4d8",
                fontSize:12, lineHeight:1.55,
              }}>{msg.text}</div>
            </div>
          ))}
          {isThinking && (
            <div style={{ padding:"7px 11px", borderRadius:"10px 10px 10px 2px", background:"#141416", color:"#3f3f46", fontSize:12, alignSelf:"flex-start" }}>Thinking...</div>
          )}
        </div>
      )}
      <div style={{ padding:"7px 8px", borderTop:messages.length?"1px solid #141416":"none", display:"flex", gap:6 }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleSend()}
          placeholder="Why is this tile safer? What about..."
          style={{ flex:1, background:"#141416", border:"1px solid #1f1f23", borderRadius:7, padding:"7px 10px", color:"#e4e4e7", fontSize:12, outline:"none", fontFamily:"inherit" }} />
        <button onClick={handleSend} disabled={!input.trim()||isThinking}
          style={{
            background:input.trim()&&!isThinking?"#0e7490":"#1a1a1d",
            color:input.trim()&&!isThinking?"#cffafe":"#3f3f46",
            border:"none", borderRadius:7, padding:"7px 14px", fontSize:11, fontWeight:600,
            cursor:input.trim()&&!isThinking?"pointer":"default", fontFamily:"inherit",
          }}>Ask</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ MOCK DATA ═══════════════════════ */

const MOCK_REPLAY = {
  date:"2025-02-20", room:"Gold East", mode:"4p East",
  result:{ rank:2, score:31200, delta:"+45" },
  overallAccuracy:87.3, totalMistakes:12, bigMistakes:5,
};

const MOCK_MISTAKES = [
  {
    id:1, round:"East 2", turn:8, evDiff:-3.42, category:"Push/Fold",
    hand:["2m","3m","4m","6m","7m","2p","3p","5p","6p","7p","4s","5s","7z"],
    drew:"7z", yourDiscard:"5p", optimalDiscard:"7z",
    boardState:{
      roundWind:"East", turnNumber:8, dora:"4s", honba:0,
      you:{ seat:"South", score:25000, discards:["1z","9s","3z"], closedHandCount:13, isRiichi:false, isDealer:false, openMelds:[] },
      kamicha:{ seat:"East", score:25000, discards:["1m","9p","8s","2z","6z"], closedHandCount:13, isDealer:true, isRiichi:false, openMelds:[] },
      toimen:{ seat:"West", score:25000, discards:["3m","9s","1p","5z","4z","8m"], closedHandCount:13, isRiichi:true, riichiTurnIndex:5, openMelds:[] },
      shimocha:{ seat:"North", score:25000, discards:["7z","1s","2z","9m"], closedHandCount:13, isRiichi:false, openMelds:[] },
    },
    impact:{ type:"dealt_in", description:"You discarded 5p two turns later and dealt into West's riichi — 7700 pt mangan (pinfu tanyao dora). Folding with 7z gave you enough safe tiles to survive.", pointSwing:{ actual:"-7700", optimal:"0", diff:"7700" } },
    explanation:{
      summary:"Pushed a connecting tile into riichi when 1-2 han, 2 tiles from tenpai. Fold with the safe honor you just drew.",
      details:[
        "West declared riichi on turn 6. You drew 7z — completely safe, no value to your hand. A gift for folding.",
        "Your hand is pinfu-only at best, still 2 tiles from tenpai. Pushing 5p breaks 5-6-7p without getting closer.",
        "West's discards (early 3m, late riichi) suggest natural development — not a bluff. Expected deal-in: 5000-8000 pts.",
        "Folding costs ~8% win chance on a cheap hand. The EV math overwhelmingly favors folding.",
      ],
      principle:"When 2+ tiles from tenpai against riichi, fold unless mangan+ or fast tenpai with safe tiles along the way.",
    },
  },
  {
    id:2, round:"East 3", turn:5, evDiff:-2.87, category:"Efficiency",
    hand:["1m","2m","3m","5m","5m","3p","4p","7p","8p","3s","4s","5s","6s"],
    drew:"6p", yourDiscard:"6s", optimalDiscard:"5m",
    boardState:{
      roundWind:"East", turnNumber:5, dora:"3p", honba:0,
      you:{ seat:"South", score:22800, discards:["9m","1z"], closedHandCount:13, isRiichi:false, isDealer:false, openMelds:[] },
      kamicha:{ seat:"East", score:27200, discards:["7z","2z","9p"], closedHandCount:13, isDealer:true, isRiichi:false, openMelds:[] },
      toimen:{ seat:"West", score:25000, discards:["1z","4z"], closedHandCount:13, isRiichi:false, openMelds:[] },
      shimocha:{ seat:"North", score:25000, discards:["9s","5z"], closedHandCount:13, isRiichi:false, openMelds:[] },
    },
    impact:{ type:"missed_win", description:"Shimocha discarded 2s two turns later. With 3-4-5-6s intact, you'd have been tenpai. Instead won 3 turns later for less value.", pointSwing:{ actual:"+3900", optimal:"+7700", diff:"3800" } },
    explanation:{
      summary:"Broke the wrong shape. Discarding 6s kills connectivity; discarding 5m keeps higher tile acceptance and preserves dora.",
      details:[
        "Your value engine is 3p (dora) in pinzu. The 6p draw locks in 3p-4p + 6p-7p-8p. Protect this.",
        "3-4-5-6s branches into multiple completions (2s, 7s). Meanwhile 5m-5m is a pair blocking flexibility.",
        "Discard 5m → 9 useful tile types (~18 tiles). Discard 6s → 6 types (~12 tiles). ~50% more acceptance.",
        "Turn 5, no riichi — pure efficiency is king. No defensive reason to hold the pair.",
      ],
      principle:"Early hand: prefer connected shapes over pairs unless the pair contributes to hand value or you have excess connectivity.",
    },
  },
  {
    id:3, round:"East 1 Honba 1", turn:14, evDiff:-1.95, category:"Riichi Decision",
    hand:["4m","5m","6m","2p","3p","4p","6p","7p","8p","6s","7s","8s","3m"],
    drew:"3m", yourDiscard:"3m", optimalDiscard:"3m (with riichi)",
    boardState:{
      roundWind:"East", turnNumber:14, dora:"6p", honba:1,
      you:{ seat:"East", score:18200, discards:["1z","4z","9m","1p","9s","2z","8m","3z","5z","1m","9p","7z","1s"], closedHandCount:13, isDealer:true, isRiichi:false, openMelds:[] },
      kamicha:{ seat:"South", score:28500, discards:["2z","7z","1z","9m","1m","4z","8s","1s","9p","3z","5z"], closedHandCount:13, isRiichi:false, openMelds:[] },
      toimen:{ seat:"West", score:26300, discards:["9s","5z","1z","7z","3z","9p","2z","8m","4z","1p","9m","8p"], closedHandCount:13, isRiichi:false, openMelds:[] },
      shimocha:{ seat:"North", score:27000, discards:["6z","2z","9s","1z","4z","7z","3z","1m","9m","5z"], closedHandCount:10, isRiichi:false, openMelds:[{ type:"chi", tiles:["1s","2s","3s"], calledFrom:0 }] },
    },
    impact:{ type:"position_loss", description:"Won dama tsumo for 2600 all. Riichi → 5200 all minimum. 7800 pt gap kept you 3rd instead of 2nd.", pointSwing:{ actual:"+7800", optimal:"+15600", diff:"7800" } },
    explanation:{
      summary:"Dama'd pinfu + dora as dealer in 3rd. Riichi adds massive value and pressure — stealth isn't worth it when behind.",
      details:[
        "Tenpai on 2m-5m (two-sided, 6 live). Pinfu + dora = 2600 all. With riichi: 5200 all, plus ippatsu/uradora upside.",
        "At 18200 in 3rd as dealer, 5200 all jumps you to 2nd. 2600 all barely matters.",
        "No opposing riichi, turn 14. Dama risks exhaustive draw. Riichi pressures folds and maintains dealership.",
        "Dama logic (protect lead, trap pushers) doesn't apply — you're behind.",
      ],
      principle:"Dealer in 3rd/4th with a good wait: riichi unless already mangan+ and opponents likely to push into dama.",
    },
  },
  {
    id:4, round:"East 4", turn:11, evDiff:-1.53, category:"Calling Decision",
    hand:["3m","4m","7m","8m","9m","2p","3p","4p","7s","8s","3s","3s","6z"],
    drew:null, yourDiscard:null, optimalDiscard:"Chi 5m → discard 6z",
    boardState:{
      roundWind:"East", turnNumber:11, dora:"3s", honba:0,
      you:{ seat:"South", score:31200, discards:["1z","2z","9p","5z","7z","4z","1m","1p","9s","8p"], closedHandCount:13, isRiichi:false, isDealer:false, openMelds:[] },
      kamicha:{ seat:"East", score:20800, discards:["3z","6z","9m","1z","5z","2z","7z","4z","1p","5m"], closedHandCount:13, isDealer:true, isRiichi:false, openMelds:[] },
      toimen:{ seat:"West", score:22000, discards:["9p","1z","4z","2z","3z","9s","1s","7z"], closedHandCount:10, isRiichi:false, openMelds:[{ type:"pon", tiles:["6z","6z","6z"], calledFrom:1 }] },
      shimocha:{ seat:"North", score:26000, discards:["7z","5z","9m","1z","2z","3z","9p","8s","4z"], closedHandCount:13, isRiichi:false, openMelds:[] },
    },
    impact:{ type:"no_direct", description:"You passed. Drew 1s next, still one away. Round ended in exhaustive draw — noten (-1000). Calling → tenpai for mangan tsumo or noten payments.", pointSwing:{ actual:"-1000", optimal:"+3000 to +8000", diff:"4000+" } },
    explanation:{
      summary:"Kamicha discarded 5m — chi gives instant tenpai with dora pair (3s×2). Mangan hand worth accelerating.",
      details:[
        "Chi 5m with 3m-4m, discard 6z → tenpai on 6s-9s, pair of 3s (dora×2). Open tanyao + dora 2 = mangan.",
        "Without calling: 2+ draws to tenpai, risk of opponents getting there first.",
        "Cost of opening: lose riichi/tsumo chance. Gain: immediate mangan tenpai. Strongly positive.",
        "At 31200 in 1st, a mangan locks the game. Speed > marginal value.",
      ],
      principle:"Call when the open hand is already mangan+. Menzen bonus is irrelevant at maximum useful value.",
    },
  },
  {
    id:5, round:"East 2 Honba 1", turn:16, evDiff:-1.21, category:"Defense",
    hand:["2m","4m","6m","8p","9p","1s","3s","7s","9s","4z","4z","5z","6z"],
    drew:"6z", yourDiscard:"6m", optimalDiscard:"9s",
    boardState:{
      roundWind:"East", turnNumber:16, dora:"8m", honba:1,
      you:{ seat:"North", score:19800, discards:["1z","7z","3z","5m","2z","1p","8m","9m","3p","7p","4p","2s","5s","6s","8s"], closedHandCount:13, isRiichi:false, isDealer:false, openMelds:[] },
      kamicha:{ seat:"West", score:28200, discards:["9p","1z","2z","4z","3z","9s","1s","7z","5z"], closedHandCount:10, isRiichi:false, openMelds:[{ type:"chi", tiles:["1m","2m","3m"], calledFrom:2 }] },
      toimen:{ seat:"South", score:24000, discards:["5z","7z","1z","3z","4z","2z","9p","9m","1p","8p"], closedHandCount:13, isRiichi:false, openMelds:[] },
      shimocha:{ seat:"East", score:28000, discards:["2z","1z","7z","3z","4z","5z","1p","9p","1m","6z","9m","3m"], closedHandCount:13, isDealer:true, isRiichi:true, riichiTurnIndex:11, openMelds:[] },
    },
    impact:{ type:"dealt_in", description:"6m was dealer's winning tile — haneman (riichi pinfu iipeiko dora, 12000 pts). 9s was safe: 8s in pond, no souzu in dealer's pattern.", pointSwing:{ actual:"-12000", optimal:"0", diff:"12000" } },
    explanation:{
      summary:"Folding against dealer riichi — chose 6m over 9s. The terminal with adjacent tiles visible was far safer than a middle tile near the dora suit.",
      details:[
        "Dealer riichi turn 12. You're folding — correct — but tile selection within the fold matters enormously vs dealer.",
        "6m: middle manzu, dora is 8m. Dealer's pond has almost no manzu (1m, 3m late). Suggests they're holding manzu shapes.",
        "9s: terminal, 8s already in your discards. Only realistic waits: tanki or 8-9s penchan — uncommon. 6m fits 4-5m, 5-6m, 6-7m.",
        "Against dealer riichi, deal-in penalty is doubled. Even 1-2% safety difference is significant.",
      ],
      principle:"Folding priority: genbutsu > adjacent tiles visible > terminals > middle tiles near dora suit. Against dealer, maximize safety margin.",
    },
  },
];

/* ═══════════════════════ HELPERS ═══════════════════════ */

function evColor(ev) {
  if (ev<=-3) return "#f87171";
  if (ev<=-2) return "#fb923c";
  if (ev<=-1.5) return "#fbbf24";
  return "#facc15";
}
const catIcons = { "Push/Fold":"🛡️", Efficiency:"⚡", "Riichi Decision":"🎯", "Calling Decision":"📢", Defense:"🧱" };

/* ═══════════════════════ MISTAKE CARD ═══════════════════════ */

function MistakeCard({ mistake, isOpen, onToggle }) {
  const m = mistake;
  const border = isOpen
    ? (m.evDiff<=-3 ? "rgba(239,68,68,0.25)" : m.evDiff<=-2 ? "rgba(251,146,60,0.2)" : "rgba(250,204,21,0.15)")
    : "#1a1a1d";

  return (
    <div style={{ border:`1px solid ${border}`, borderRadius:14, background:"#0f0f12", transition:"all 0.2s", overflow:"hidden" }}>
      <button onClick={onToggle} style={{
        width:"100%", display:"flex", alignItems:"center", gap:12,
        padding:"13px 16px", background:"none", border:"none",
        cursor:"pointer", textAlign:"left", color:"inherit", fontFamily:"inherit",
      }}>
        <div style={{ width:28, height:28, borderRadius:7, background:"#1a1a1d", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>
          {catIcons[m.category]||"❓"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, fontWeight:700, color:"#d4d4d8" }}>{m.round}</span>
            <span style={{ fontSize:10, color:"#3f3f46" }}>T{m.turn}</span>
            <span style={{ fontSize:9, color:"#52525b", background:"#1a1a1d", padding:"2px 7px", borderRadius:20 }}>{m.category}</span>
          </div>
          {!isOpen && <p style={{ fontSize:11, color:"#52525b", marginTop:2, lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.explanation.summary}</p>}
        </div>
        <div style={{ textAlign:"right", flexShrink:0, paddingLeft:8 }}>
          <div style={{ fontSize:19, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", color:evColor(m.evDiff), letterSpacing:"-0.02em" }}>{m.evDiff.toFixed(2)}</div>
          <div style={{ fontSize:8, color:"#27272a", textTransform:"uppercase", letterSpacing:"0.06em" }}>EV diff</div>
        </div>
        <div style={{ color:"#27272a", fontSize:14, flexShrink:0, transition:"transform 0.2s", transform:isOpen?"rotate(180deg)":"none" }}>▾</div>
      </button>

      {isOpen && (
        <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:12, borderTop:"1px solid #141416" }}>
          <div style={{ paddingTop:12 }}><TableBoard data={m.boardState} /></div>

          <div>
            <div style={{ fontSize:9, color:"#3f3f46", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>Your Hand</div>
            <TileRow tiles={m.hand} size="md" />
            {m.drew && (
              <div style={{ marginTop:5, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:10, color:"#27272a" }}>Drew:</span>
                <Tile tile={m.drew} size="md" />
              </div>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div style={{ padding:10, borderRadius:9, background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.1)" }}>
              <div style={{ fontSize:9, color:"#f87171", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Your Play</div>
              {m.yourDiscard ? (
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <Tile tile={m.yourDiscard} highlight="bad" size="lg" />
                  <span style={{ fontSize:11, color:"#71717a" }}>Discard {m.yourDiscard}</span>
                </div>
              ) : <span style={{ fontSize:11, color:"#52525b", fontStyle:"italic" }}>Passed on call</span>}
            </div>
            <div style={{ padding:10, borderRadius:9, background:"rgba(52,211,153,0.04)", border:"1px solid rgba(52,211,153,0.1)" }}>
              <div style={{ fontSize:9, color:"#34d399", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Optimal Play</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                {m.optimalDiscard && !m.optimalDiscard.includes("Chi") && !m.optimalDiscard.includes("with") ? (
                  <Tile tile={m.optimalDiscard} highlight="good" size="lg" />
                ) : null}
                <span style={{ fontSize:11, color:"#71717a" }}>{m.optimalDiscard||"—"}</span>
              </div>
            </div>
          </div>

          <ImpactPanel impact={m.impact} />

          <div>
            <div style={{ fontSize:9, color:"#3f3f46", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Analysis</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {m.explanation.details.map((d,i) => (
                <div key={i} style={{ display:"flex", gap:9 }}>
                  <span style={{ color:"#1f1f23", fontFamily:"'JetBrains Mono',monospace", fontSize:10, marginTop:2, flexShrink:0, width:12, textAlign:"right" }}>{i+1}.</span>
                  <p style={{ color:"#a1a1aa", fontSize:12.5, lineHeight:1.6, margin:0 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding:12, borderRadius:9, background:"rgba(8,145,178,0.05)", border:"1px solid rgba(8,145,178,0.12)" }}>
            <div style={{ fontSize:9, color:"#22d3ee", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>Takeaway</div>
            <p style={{ fontSize:12.5, color:"rgba(207,250,254,0.7)", lineHeight:1.6, margin:0 }}>{m.explanation.principle}</p>
          </div>

          <MistakeChat mistakeId={m.id} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ MAIN ═══════════════════════ */

export default function MahjongStudyTool() {
  const [openId, setOpenId] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const r = MOCK_REPLAY;
  const totalEvLoss = MOCK_MISTAKES.reduce((s,m)=>s+m.evDiff, 0);

  return (
    <div style={{ minHeight:"100vh", background:"#09090b", color:"#e4e4e7", fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;700;800&family=Noto+Serif:wght@400;700;800&display=swap');
        * { box-sizing:border-box; margin:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1f1f23; border-radius:3px; }
        input::placeholder { color:#3f3f46; }
      `}</style>

      <div style={{ borderBottom:"1px solid #141416", background:"rgba(9,9,11,0.92)", backdropFilter:"blur(8px)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ maxWidth:760, margin:"0 auto", padding:"11px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"rgba(8,145,178,0.07)", border:"1px solid rgba(8,145,178,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:"#22d3ee", fontSize:15, fontWeight:800, fontFamily:"'Noto Serif',serif" }}>牌</div>
            <div>
              <h1 style={{ fontSize:13, fontWeight:700, color:"#e4e4e7", letterSpacing:"-0.01em" }}>Replay Study</h1>
              <span style={{ fontSize:10, color:"#3f3f46" }}>{r.date} · {r.room} · {r.mode}</span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ color:"#3f3f46" }}>Result</div>
              <div style={{ fontWeight:700, fontSize:11 }}>
                {["🥇","🥈","🥉","4th"][r.result.rank-1]} {r.result.score.toLocaleString()}{" "}
                <span style={{ color:r.result.delta.startsWith("+")?"#4ade80":"#f87171" }}>({r.result.delta})</span>
              </div>
            </div>
            <div style={{ width:1, height:22, background:"#1a1a1d" }} />
            <div style={{ textAlign:"right" }}>
              <div style={{ color:"#3f3f46" }}>Accuracy</div>
              <div style={{ fontWeight:700, fontSize:11 }}>{r.overallAccuracy}%</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"12px 20px 4px" }}>
        <div style={{ display:"flex", gap:6, fontSize:11 }}>
          <div style={{ padding:"4px 10px", borderRadius:6, background:"#0f0f12", border:"1px solid #1a1a1d" }}>
            <span style={{ color:"#3f3f46" }}>Mistakes </span><span style={{ fontWeight:600 }}>{r.totalMistakes}</span>
            <span style={{ color:"#1a1a1d", margin:"0 4px" }}>·</span>
            <span style={{ color:"#3f3f46" }}>Major </span><span style={{ color:"#f87171", fontWeight:600 }}>{r.bigMistakes}</span>
          </div>
          <div style={{ padding:"4px 10px", borderRadius:6, background:"#0f0f12", border:"1px solid #1a1a1d" }}>
            <span style={{ color:"#3f3f46" }}>EV lost </span>
            <span style={{ color:"#f87171", fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{totalEvLoss.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"8px 20px 32px", display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
          <span style={{ fontSize:9, fontWeight:700, color:"#27272a", textTransform:"uppercase", letterSpacing:"0.08em" }}>Top 5 Biggest Mistakes</span>
          <span style={{ fontSize:9, color:"#1f1f23" }}>By EV impact</span>
        </div>

        {MOCK_MISTAKES.map(m => (
          <MistakeCard key={m.id} mistake={m} isOpen={openId===m.id}
            onToggle={()=>setOpenId(openId===m.id?null:m.id)} />
        ))}

        <button onClick={()=>{ setIsLoadingMore(true); setTimeout(()=>setIsLoadingMore(false),2500); }}
          disabled={isLoadingMore}
          style={{
            marginTop:4, width:"100%", padding:"13px", borderRadius:11,
            border:"1px dashed #1a1a1d", background:"transparent",
            color:isLoadingMore?"#27272a":"#3f3f46",
            fontSize:12, fontWeight:600, cursor:isLoadingMore?"default":"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontFamily:"inherit",
          }}>
          {isLoadingMore ? (
            <>
              <span style={{ display:"inline-block", width:12, height:12, border:"2px solid #1f1f23", borderTopColor:"#3f3f46", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
              Analyzing next 5...
            </>
          ) : "+ Generate 5 More Insights"}
        </button>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"0 20px 40px", textAlign:"center" }}>
        <p style={{ fontSize:10, color:"#141416" }}>Mortal AI · Claude · v0.5</p>
      </div>
    </div>
  );
}
