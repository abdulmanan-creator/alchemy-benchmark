import React from "react";
/* global React */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Data ─────────────────────────────────────────────────────────────────────
export const PROVIDERS = [
  { id: "alchemy", name: "Alchemy", short: "ALC", color: "#10B981", soft: "#6FE6B5", isUs: true },
  { id: "infura", name: "Infura", short: "INF", color: "#4F8CFF" },
  { id: "quicknode", name: "Quicknode", short: "QKN", color: "#F97316" },
  { id: "drpc", name: "dRPC", short: "DRP", color: "#FBBF24" },
  { id: "chainstack", name: "Chainstack", short: "CSK", color: "#C084FC" },
];

export const METHODS = [
  { name: "eth_getBalance", weight: 22 },
  { name: "eth_getBlockByNumber", weight: 18 },
  { name: "eth_getLogs", weight: 16 },
  { name: "eth_call", weight: 14 },
  { name: "eth_getTransactionReceipt", weight: 12 },
  { name: "eth_blockNumber", weight: 10 },
  { name: "alchemy_getTokenBalances", weight: 8 },
];

export const REGIONS = [
  { id: "us-east", name: "US East",     x: 28,  y: 42 },
  { id: "us-west", name: "US West",     x: 14,  y: 44 },
  { id: "eu",      name: "EU Central",  x: 50,  y: 36 },
  { id: "ap",      name: "AP Southeast", x: 78, y: 56 },
];

// Synthetic baseline latencies (ms) — Alchemy fastest by design
export const BASELINE = {
  alchemy:    { avg: 23,  p50: 18,  p95: 64,  p99: 112, success: 99.99, errs: 12 },
  infura:     { avg: 108, p50: 98,  p95: 268, p99: 412, success: 99.92, errs: 124 },
  quicknode:  { avg: 54,  p50: 42,  p95: 196, p99: 320, success: 99.78, errs: 422 },
  drpc:       { avg: 118, p50: 92,  p95: 540, p99: 820, success: 99.31, errs: 980 },
  chainstack: { avg: 86,  p50: 72,  p95: 248, p99: 380, success: 99.81, errs: 312 },
};

// ── Icons (Lucide-style strokes) ─────────────────────────────────────────────
export const I = {
  upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  paste: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  api: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 3v18"/><path d="M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>,
  preset: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>,
  pulse: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="2 12 6 12 9 4 15 20 18 12 22 12"/></svg>,
  flag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M4 22V4l8 3 8-3v12l-8 3-8-3z"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>,
};

// ── AlchemyMark ──────────────────────────────────────────────────────────────
export function AlchemyMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="14" fill="#363FF9"/>
      <path d="M32 14 L50 46 L41.5 46 L32 29.5 L22.5 46 L14 46 Z" fill="#fff"/>
      <path d="M25.5 39.5 L38.5 39.5 L34.5 46 L29.5 46 Z" fill="#363FF9"/>
    </svg>
  );
}

// ── Sparkline ────────────────────────────────────────────────────────────────
export function Sparkline({ data, color = "#4F8CFF", width = 200, height = 36, fill = true }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = (max - min) || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const linePath = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const areaPath = linePath + ` L${width},${height} L0,${height} Z`;
  const id = "sg" + color.replace("#", "");
  return (
    <svg width={width} height={height} className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill={`url(#${id})`}/>}
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Multi-line chart (latency over time, all providers) ──────────────────────
export function MultiLine({ series, height = 200, width = 720, providers = PROVIDERS }) {
  const allValues = series.flatMap(s => s.values);
  const max = Math.max(...allValues, 200);
  const min = 0;
  const range = max - min;
  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{display:"block"}}>
        {[0.25, 0.5, 0.75].map(p => (
          <line key={p} x1="0" x2={width} y1={height*p} y2={height*p} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>
        ))}
        {series.map(s => {
          const provider = providers.find(p => p.id === s.id);
          if (!provider) return null;
          const pts = s.values.map((v, i) => {
            const x = (i / (s.values.length - 1)) * width;
            const y = height - ((v - min) / range) * (height - 16) - 8;
            return [x, y];
          });
          const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
          return (
            <g key={s.id}>
              <path d={path} fill="none" stroke={provider.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity={provider.isUs ? 1 : 0.78}/>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, top: 4, fontSize: 11, color: "rgba(255,255,255,0.4)", fontVariantNumeric:"tabular-nums" }}>{Math.round(max)}ms</div>
      <div style={{ position: "absolute", left: 0, bottom: 4, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>0ms</div>
    </div>
  );
}

// ── Top nav ──────────────────────────────────────────────────────────────────
export function TopNav({ screen, setScreen }) {
  const links = [
    { id: "landing",  label: "Overview" },
    { id: "wizard",   label: "New benchmark" },
    { id: "results",  label: "Results" },
    { id: "history",  label: "History" },
  ];
  return (
    <nav className="bn-nav">
      <div className="container bn-nav-row">
        <div className="bn-brand">
          <AlchemyMark size={28}/>
          <span style={{fontSize:18, fontWeight:500}}>alchemy</span>
          <span className="b-tag">Benchmarks</span>
        </div>
        <div className="bn-nav-links">
          {links.map(l => (
            <a key={l.id} className={"bn-nav-link" + (screen.startsWith(l.id) ? " active" : "")} onClick={() => setScreen(l.id)}>{l.label}</a>
          ))}
          <a className="bn-nav-link">Methodology</a>
          <a className="bn-nav-link">Docs</a>
        </div>
        <div className="bn-nav-right">
          <button className="btn btn-ghost btn-sm">Sign in</button>
          <button className="btn btn-primary btn-sm" onClick={() => setScreen("wizard")}>Run a benchmark {I.arrow}</button>
        </div>
      </div>
    </nav>
  );
}

// ── Live Race Visualization ──────────────────────────────────────────────────
// One of the standout moments. Each provider has a horizontal lane; pulses of
// light travel across as requests complete. Faster providers' pulses arrive
// sooner — the speed difference becomes physically visible.
export function LiveRace({ tone = "live", lanes = PROVIDERS, baseline = BASELINE, running = true }) {
  // Each lane's animated pulse position (0..1). We tick all lanes on the same
  // cadence; faster providers travel further per tick.
  const [tick, setTick] = useState(0);
  const [latencies, setLatencies] = useState(() => {
    const o = {};
    lanes.forEach(p => { o[p.id] = baseline[p.id]?.avg || 100; });
    return o;
  });
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTick(t => t + 1);
      setLatencies(prev => {
        const next = {};
        for (const p of lanes) {
          const base = baseline[p.id]?.avg || 100;
          const jitter = (Math.random() - 0.5) * base * 0.35;
          next[p.id] = Math.max(8, base + jitter);
        }
        return next;
      });
    }, 800);
    return () => clearInterval(t);
  }, [running, lanes, baseline]);

  // Sort by latency for live ranking
  const ranked = [...lanes].sort((a,b) => (latencies[a.id]||0) - (latencies[b.id]||0));
  const slowest = Math.max(...lanes.map(p => latencies[p.id] || 0), 1);

  return (
    <div className="race">
      <div className="race-head">
        <h4>Live race · 24h sample · sepolia mainnet</h4>
        {tone === "live" && <span className="live-tag"><i/> Live</span>}
      </div>
      {lanes.map(p => {
        const lat = latencies[p.id] || 0;
        const widthPct = Math.min(100, (lat / slowest) * 100);
        const rank = ranked.findIndex(r => r.id === p.id) + 1;
        const cls = p.isUs ? "alchemy" : (lat > 200 ? "bad" : lat > 80 ? "warn" : "");
        return (
          <div className="race-lane" key={p.id}>
            <div className="race-name">
              <i style={{ background: p.color }}/>
              {p.name}
            </div>
            <div className="race-track">
              <div className={"race-fill " + cls} style={{ width: widthPct + "%" }}/>
              <div className={"race-pulse" + (p.isUs ? " alchemy" : "")} style={{ left: widthPct + "%" }}/>
            </div>
            <div className="race-num">
              {Math.round(lat)} ms
              <small>avg</small>
            </div>
            <div className="race-rank">
              {rank === 1 ? <b>#1</b> : "#" + rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { PROVIDERS, METHODS, REGIONS, BASELINE, I, AlchemyMark, Sparkline, MultiLine, TopNav, LiveRace });
