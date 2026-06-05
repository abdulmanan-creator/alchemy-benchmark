import React from "react";
import { PROVIDERS, METHODS, REGIONS, BASELINE, I, AlchemyMark, Sparkline, MultiLine, LiveRace } from "./data.jsx";
/* global React, PROVIDERS, METHODS, REGIONS, BASELINE, I, AlchemyMark, Sparkline, MultiLine, LiveRace */
const { useState, useEffect, useRef, useMemo } = React;

// ─── RUNNING ────────────────────────────────────────────────────────────────
export function Running({ wizardState, setScreen }) {
  const [progress, setProgress] = useState(0);
  const [counters, setCounters] = useState({ sent: 0, ok: 0, ms: 0, p95: 0 });
  const [logRows, setLogRows] = useState([]);
  const [latencySeries, setLatencySeries] = useState(() =>
    PROVIDERS.map(p => ({ id: p.id, values: Array(40).fill(BASELINE[p.id]?.avg || 100) }))
  );
  const logRef = useRef(null);
  const totalDuration = 24 * 1000; // 24s simulated run

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(pct);

      // Counter updates
      setCounters(c => {
        const newSent = c.sent + Math.floor(40 + Math.random() * 30);
        const failures = Math.floor(Math.random() * 2);
        return {
          sent: newSent,
          ok: c.ok + Math.floor(40 + Math.random() * 28) - failures,
          ms: 23 + Math.round(Math.random() * 6),
          p95: 64 + Math.round(Math.random() * 24),
        };
      });

      // Latency series tick
      setLatencySeries(prev => prev.map(s => {
        const base = BASELINE[s.id]?.avg || 100;
        const jitter = (Math.random() - 0.5) * base * 0.4;
        const next = [...s.values.slice(1), Math.max(8, base + jitter)];
        return { ...s, values: next };
      }));

      // Log rows
      const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)];
      const method = METHODS[Math.floor(Math.random() * METHODS.length)];
      const baseLat = BASELINE[provider.id]?.avg || 100;
      const lat = Math.round(baseLat + (Math.random() - 0.5) * baseLat * 0.6);
      const fail = Math.random() < (provider.id === "alchemy" ? 0.001 : 0.012);
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      setLogRows(rows => {
        const next = [...rows, {
          time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"}),
          provider,
          method: method.name,
          lat,
          fail,
          region: region.name,
          id: rows.length,
        }];
        return next.slice(-80);
      });

      if (elapsed >= totalDuration) clearInterval(tick);
    }, 250);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logRows.length]);

  const eta = Math.max(0, Math.round((totalDuration - (totalDuration * progress / 100)) / 1000));

  return (
    <div className="container run-shell">
      <div className="run-head">
        <div>
          <div className="eyebrow on-dark" style={{marginBottom:8}}>Run · #BR-2026-05-07-3142</div>
          <h1>Benchmark in progress</h1>
          <div className="run-sub">2-min live sample · {wizardState?.detected?.name || "polymarket-prod-2026-05-07.har"}</div>
        </div>
        <div className="run-progress">
          <div className="run-progress-meta"><span>Progress</span><span>{Math.round(progress)}%</span></div>
          <div className="run-progress-bar"><i style={{width: progress + "%"}}/></div>
          <div className="run-progress-meta"><span>{counters.sent.toLocaleString()} replays sent</span><span>{eta}s remaining</span></div>
        </div>
      </div>

      <div className="counter-strip">
        <div className="counter-card">
          <div className="c-label">Total replays</div>
          <div className="c-value">{counters.sent.toLocaleString()}</div>
          <div className="c-sub">↑ across 5 providers</div>
        </div>
        <div className="counter-card hi">
          <div className="c-label">Alchemy avg latency</div>
          <div className="c-value">{counters.ms} ms</div>
          <div className="c-sub">leading by 4.6×</div>
        </div>
        <div className="counter-card">
          <div className="c-label">Alchemy p95</div>
          <div className="c-value">{counters.p95} ms</div>
          <div className="c-sub">tail latency</div>
        </div>
        <div className="counter-card">
          <div className="c-label">Failed requests</div>
          <div className="c-value">{Math.max(0, counters.sent - counters.ok)}</div>
          <div className="c-sub">3.2% on slowest competitor</div>
        </div>
      </div>

      <div className="run-grid">
        <div className="col-stack">
          <div className="panel">
            <div className="panel-h">
              <h3>Live race · all providers</h3>
              <span className="live-tag" style={{display:"inline-flex", alignItems:"center", gap:6, fontSize:11, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--success)"}}>
                <i style={{width:6,height:6,borderRadius:"50%",background:"var(--success)", animation:"pulse 1.4s infinite"}}/> Live
              </span>
            </div>
            <LiveRace running={progress < 100} tone="live" baseline={BASELINE} lanes={[...PROVIDERS]}/>
          </div>

          <div className="panel">
            <div className="panel-h">
              <h3>Avg latency over time</h3>
              <span style={{fontSize:11, color:"rgba(255,255,255,0.5)"}}>last 40 samples</span>
            </div>
            <MultiLine series={latencySeries}/>
            <div style={{display:"flex", gap:16, marginTop: 12, flexWrap:"wrap"}}>
              {PROVIDERS.map(p => (
                <div key={p.id} style={{display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,255,255,0.7)"}}>
                  <i style={{width:8, height:8, background:p.color, borderRadius:2}}/> {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-stack">
          <div className="panel">
            <div className="panel-h"><h3>Live request feed</h3><span style={{fontSize:11, color:"rgba(255,255,255,0.5)"}}>most recent 80</span></div>
            <div className="log-feed" ref={logRef}>
              {logRows.map(r => (
                <div key={r.id} className={"l-row" + (r.fail ? " l-fail" : "")}>
                  <span className="l-time">{r.time}</span>
                  <span className={"l-prov " + r.provider.id}>{r.provider.name}</span>
                  <span className="l-method">{r.method}</span>
                  <span className="l-num">{r.fail ? "FAIL" : r.lat + "ms"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{display:"flex", flexDirection:"column", gap: 12}}>
            <div className="panel-h"><h3>Working regions</h3></div>
            {REGIONS.map(r => (
              <div key={r.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13}}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <span style={{width:6, height:6, borderRadius:"50%", background:"var(--success)", boxShadow:"0 0 6px var(--success)"}}/>
                  {r.name}
                </div>
                <span style={{color:"rgba(255,255,255,0.55)", fontVariantNumeric:"tabular-nums"}}>{Math.round(counters.sent/4)} req</span>
              </div>
            ))}
          </div>

          {progress >= 100 && (
            <button className="btn btn-primary btn-lg" onClick={() => setScreen("results")} style={{padding: 18}}>
              View full results {I.arrow}
            </button>
          )}
        </div>
      </div>

      {progress >= 100 && (
        <div style={{marginTop: 24, padding: 20, borderRadius: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", gap: 16}}>
          <div style={{width:36, height:36, borderRadius:10, background:"rgba(16,185,129,0.18)", color:"var(--success)", display:"flex", alignItems:"center", justifyContent:"center"}}>{I.check}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:500, marginBottom:2}}>Sample run complete · full run queued</div>
            <div style={{fontSize:13, color:"rgba(255,255,255,0.65)"}}>Full 30-minute run will email you a complete report. Live preview ready below.</div>
          </div>
          <button className="btn btn-primary" onClick={() => setScreen("results")}>See results {I.arrow}</button>
        </div>
      )}
    </div>
  );
}

// ─── RESULTS ────────────────────────────────────────────────────────────────
export function Results({ resultsLayout, setScreen }) {
  const [tab, setTab] = useState("overview");
  return (
    <div className="container res-shell">
      <ResultsHero/>
      <div className="res-tabs">
        {[
          { id: "overview", label: "Overview" },
          { id: "latency", label: "Latency" },
          { id: "reliability", label: "Reliability" },
          { id: "geographic", label: "Geographic" },
          { id: "methods", label: "Per-method" },
          { id: "share", label: "Share" },
        ].map(t => (
          <button key={t.id} className={"res-tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <div style={{marginLeft:"auto", display:"flex", gap:8, alignItems:"center"}}>
          <button className="btn btn-ghost btn-sm">{I.download} Export PDF</button>
          <button className="btn btn-secondary btn-sm">{I.share} Share link</button>
        </div>
      </div>
      {tab === "overview" && <ResultsOverview layout={resultsLayout}/>}
      {tab === "latency" && <ResultsLatency/>}
      {tab === "reliability" && <ResultsReliability/>}
      {tab === "geographic" && <ResultsGeographic/>}
      {tab === "methods" && <ResultsMethods/>}
      {tab === "share" && <ShareCard/>}
    </div>
  );
}

function ResultsHero() {
  return (
    <div className="res-hero">
      <div className="res-hero-text">
        <div className="res-hero-eyebrow">▾ Verdict · run #BR-2026-05-07-3142</div>
        <h1 className="res-hero-h1">Alchemy was <b>4.7× faster</b> on your traffic.</h1>
        <p className="res-hero-sub">23ms avg vs. 108ms across 4 competitors. Highest success rate of any provider tested. Significant geographic advantage in EU and AP Southeast.</p>
        <div className="res-hero-stats">
          <div className="res-hero-stat"><div className="v up">23<span style={{fontSize:18}}>ms</span></div><div className="l">avg latency</div></div>
          <div className="res-hero-stat"><div className="v up">99.99<span style={{fontSize:18}}>%</span></div><div className="l">success rate</div></div>
          <div className="res-hero-stat"><div className="v up">$8.4k<span style={{fontSize:18}}>/mo</span></div><div className="l">est. p95-driven cost saving</div></div>
        </div>
      </div>
      <div className="res-hero-art">
        <div className="res-hero-trophy">
          <svg viewBox="0 0 64 64" width="120" height="120">
            <path d="M32 14 L50 46 L41.5 46 L32 29.5 L22.5 46 L14 46 Z" fill="#fff"/>
            <path d="M25.5 39.5 L38.5 39.5 L34.5 46 L29.5 46 Z" fill="rgba(255,255,255,0.4)"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ResultsOverview({ layout }) {
  if (layout === "parity") return <ResultsOverviewParity/>;
  if (layout === "detailed") return <ResultsOverviewDetailed/>;
  return <ResultsOverviewVerdict/>;
}

function ResultsOverviewVerdict() {
  return (
    <div className="run-grid">
      <div className="col-stack">
        <div className="panel">
          <div className="panel-h"><h3>Latency at every percentile</h3><span style={{fontSize:11, color:"rgba(255,255,255,0.5)"}}>across 84,321 replays</span></div>
          <div className="lat-grid">
            {["avg","p50","p95","p99"].map(metric => <LatencyCard key={metric} metric={metric}/>)}
          </div>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Reliability scorecard</h3><span style={{fontSize:11, color:"rgba(255,255,255,0.5)"}}>weighted across regions and methods</span></div>
          <ReliabilityScores/>
        </div>
      </div>
      <div className="col-stack">
        <div className="panel">
          <div className="panel-h"><h3>Geographic performance</h3></div>
          <GeoMap/>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>What we tested</h3></div>
          <div style={{fontSize:13, lineHeight:1.7, color:"rgba(255,255,255,0.78)"}}>
            <Stat l="Workload source" v="polymarket-prod-2026-05-07.har"/>
            <Stat l="Total replays" v="84,321"/>
            <Stat l="Methods" v="9 (eth_getBalance, eth_getLogs, …)"/>
            <Stat l="Chains" v="Ethereum, Optimism, Base"/>
            <Stat l="Regions" v="US East, US West, EU, AP Southeast"/>
            <Stat l="Window" v="May 7, 2026 · 14:32 – 15:02 UTC"/>
            <Stat l="Methodology" v="public · standard paid tier"/>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ l, v }) {
  return <div style={{display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px dashed rgba(255,255,255,0.06)"}}><span style={{color:"rgba(255,255,255,0.5)"}}>{l}</span><b style={{fontWeight:500}}>{v}</b></div>;
}

function ResultsOverviewParity() {
  // Side-by-side equal columns: each provider as a card with identical structure.
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap: 16}}>
      {PROVIDERS.map(p => {
        const b = BASELINE[p.id];
        return (
          <div key={p.id} className="panel" style={p.isUs ? {borderColor:"rgba(16,185,129,0.4)", boxShadow:"0 0 0 4px rgba(16,185,129,0.08)"} : {}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <i style={{width: 10, height: 10, borderRadius:"50%", background: p.color}}/>
                <strong style={{fontSize: 15}}>{p.name}</strong>
              </div>
              {p.isUs && <span className="pill win">▾ Winner</span>}
            </div>
            <div style={{display:"flex", flexDirection:"column", gap: 12}}>
              {[
                ["avg", b.avg + "ms"],
                ["p50", b.p50 + "ms"],
                ["p95", b.p95 + "ms"],
                ["p99", b.p99 + "ms"],
                ["success", b.success + "%"],
                ["errors", b.errs.toLocaleString()],
              ].map(([l, v]) => (
                <div key={l} style={{display:"flex", justifyContent:"space-between", fontSize: 13}}>
                  <span style={{color:"rgba(255,255,255,0.55)", textTransform:"uppercase", letterSpacing:"0.04em", fontSize:11}}>{l}</span>
                  <b style={{fontVariantNumeric:"tabular-nums", color: p.isUs ? "var(--success-soft)" : "#fff"}}>{v}</b>
                </div>
              ))}
            </div>
            <div style={{marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--dark-border)"}}>
              <Sparkline data={[...Array(20)].map(() => b.avg + (Math.random() - 0.5) * b.avg * 0.5)} color={p.color} width={180} height={42}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResultsOverviewDetailed() {
  return (
    <div className="run-grid">
      <div className="col-stack">
        <div className="panel">
          <div className="panel-h"><h3>Per-method latency table</h3></div>
          <MethodTable/>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Failure breakdown by method</h3></div>
          <MethodTable failureMode/>
        </div>
      </div>
      <div className="col-stack">
        <div className="panel">
          <div className="panel-h"><h3>p95 distribution</h3></div>
          <div className="lat-grid" style={{gridTemplateColumns:"1fr"}}>
            <LatencyCard metric="p95"/>
          </div>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Reliability scores</h3></div>
          <ReliabilityScores compact/>
        </div>
      </div>
    </div>
  );
}

function LatencyCard({ metric }) {
  const labels = { avg: "Average", p50: "p50 (median)", p95: "p95 (tail)", p99: "p99 (worst)" };
  const max = Math.max(...PROVIDERS.map(p => BASELINE[p.id][metric]));
  return (
    <div className="lat-card">
      <h5>{labels[metric]}</h5>
      {PROVIDERS.map(p => {
        const v = BASELINE[p.id][metric];
        const pct = (v / max) * 100;
        return (
          <div className="lat-bar" key={p.id}>
            <span className="lat-name">{p.name}</span>
            <div className="lat-track">
              <div className="lat-fill" style={{width: pct + "%", background: p.color, opacity: p.isUs ? 1 : 0.65}}/>
            </div>
            <span className="lat-num" style={p.isUs ? {color:"var(--success-soft)", fontWeight:600} : {}}>{v}ms</span>
          </div>
        );
      })}
    </div>
  );
}

function ResultsLatency() {
  return (
    <div className="run-grid">
      <div className="col-stack">
        <div className="panel">
          <div className="panel-h"><h3>Latency over time · global · all methods</h3></div>
          <MultiLine series={PROVIDERS.map(p => ({ id: p.id, values: [...Array(60)].map((_, i) => {
            const base = BASELINE[p.id].avg;
            const drift = Math.sin(i / 6) * base * 0.15;
            return base + drift + (Math.random() - 0.5) * base * 0.5;
          }) }))} height={260}/>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>p95 over time · global · all methods</h3></div>
          <MultiLine series={PROVIDERS.map(p => ({ id: p.id, values: [...Array(60)].map((_, i) => {
            const base = BASELINE[p.id].p95;
            return base + (Math.random() - 0.5) * base * 0.4;
          }) }))} height={260}/>
        </div>
      </div>
      <div className="col-stack">
        <div className="panel">
          <div className="panel-h"><h3>Percentiles</h3></div>
          <div style={{display:"flex", flexDirection:"column", gap: 16}}>
            {["avg","p50","p95","p99"].map(m => <LatencyCard key={m} metric={m}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsReliability() {
  return (
    <div className="run-grid">
      <div className="col-stack">
        <div className="panel">
          <div className="panel-h"><h3>Success rate over time · global</h3></div>
          <MultiLine series={PROVIDERS.map(p => ({ id: p.id, values: [...Array(60)].map(() => 100 - (100 - BASELINE[p.id].success) * (0.5 + Math.random())) }))} height={260}/>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Failed requests by method</h3></div>
          <MethodTable failureMode/>
        </div>
      </div>
      <div className="col-stack">
        <div className="panel">
          <div className="panel-h"><h3>Reliability scores</h3></div>
          <ReliabilityScores/>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Time to finality</h3></div>
          <div style={{display:"flex", flexDirection:"column", gap: 14}}>
            {PROVIDERS.map(p => (
              <div key={p.id}>
                <div style={{display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6}}>
                  <span><i style={{width:8, height:8, borderRadius:"50%", background:p.color, display:"inline-block", marginRight:8}}/>{p.name}</span>
                  <b style={{fontVariantNumeric:"tabular-nums"}}>{p.isUs ? "+0 blocks" : p.id === "infura" ? "+0.4 blocks" : p.id === "drpc" ? "+1.8 blocks" : "+0.9 blocks"}</b>
                </div>
                <div className="lat-track" style={{height:6}}><div className="lat-fill" style={{width: p.isUs ? "5%" : p.id === "infura" ? "20%" : p.id === "drpc" ? "78%" : "45%", background: p.color}}/></div>
              </div>
            ))}
          </div>
          <div className="body-sm" style={{marginTop: 16, color:"rgba(255,255,255,0.55)"}}>How many blocks behind head each provider serves on average. Lower is fresher.</div>
        </div>
      </div>
    </div>
  );
}

function ResultsGeographic() {
  return (
    <div className="run-grid" style={{gridTemplateColumns:"1.5fr 1fr"}}>
      <div className="panel">
        <div className="panel-h"><h3>Latency by region</h3><span style={{fontSize:11, color:"rgba(255,255,255,0.5)"}}>workers in 4 regions</span></div>
        <GeoMap large/>
      </div>
      <div className="col-stack">
        {REGIONS.map(r => (
          <div className="panel" key={r.id} style={{padding: 18}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 12}}>
              <h3 style={{margin: 0, fontSize:14, fontWeight:500}}>{r.name}</h3>
              <span className="pill win">Alchemy fastest</span>
            </div>
            {PROVIDERS.map(p => {
              const offset = { "us-east": 1, "us-west": 1.05, "eu": 1.18, "ap": 1.4 }[r.id] || 1;
              const v = Math.round(BASELINE[p.id].avg * offset);
              const max = Math.round(BASELINE.drpc.avg * 1.4);
              return (
                <div className="lat-bar" key={p.id} style={{padding:"4px 0"}}>
                  <span className="lat-name" style={{fontSize:12}}>{p.name}</span>
                  <div className="lat-track" style={{height:6}}><div className="lat-fill" style={{width: (v / max * 100) + "%", background: p.color, opacity: p.isUs ? 1 : 0.6}}/></div>
                  <span className="lat-num" style={{fontSize:12, ...(p.isUs ? {color:"var(--success-soft)", fontWeight:600} : {})}}>{v}ms</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsMethods() {
  return (
    <div className="panel">
      <div className="panel-h">
        <h3>Per-method breakdown</h3>
        <div className="ctrl-row">
          <select className="field-input" style={{padding: "6px 10px", fontSize:13}}>
            <option>All regions</option>
            <option>US East only</option>
            <option>EU only</option>
          </select>
        </div>
      </div>
      <MethodTable/>
    </div>
  );
}

function MethodTable({ failureMode }) {
  return (
    <table className="method-table">
      <thead>
        <tr>
          <th>Method</th>
          {PROVIDERS.map(p => <th key={p.id} className="num"><i style={{width:8, height:8, borderRadius:"50%", background:p.color, display:"inline-block", marginRight:6, verticalAlign:1}}/>{p.short}</th>)}
        </tr>
      </thead>
      <tbody>
        {METHODS.map(m => {
          const values = PROVIDERS.map(p => {
            const base = BASELINE[p.id];
            if (failureMode) return Math.round(base.errs * (m.weight / 100) * (0.7 + Math.random() * 0.6));
            const lat = base.avg * (0.7 + Math.random() * 0.6);
            return Math.round(lat);
          });
          const winnerIdx = failureMode ? values.indexOf(Math.min(...values)) : values.indexOf(Math.min(...values));
          return (
            <tr key={m.name}>
              <td className="method">{m.name}</td>
              {PROVIDERS.map((p, i) => (
                <td key={p.id} className={"num" + (i === winnerIdx ? " winner" : "")}>{values[i]}{failureMode ? "" : "ms"}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ReliabilityScores({ compact }) {
  return (
    <>
      <div className="score-grid">
        {PROVIDERS.map(p => {
          const grade = p.isUs ? "A+" : p.id === "infura" ? "A" : p.id === "quicknode" ? "B" : p.id === "chainstack" ? "B" : "C";
          const cls = grade.charAt(0);
          return (
            <div className="score-card" key={p.id}>
              <div className="name">{p.name}</div>
              <div className={"grade " + cls}>{grade}</div>
              <div className="uptime">{BASELINE[p.id].success}%</div>
            </div>
          );
        })}
      </div>
      {!compact && (
        <div style={{marginTop: 16, padding: "12px 16px", background:"rgba(255,255,255,0.03)", borderRadius:10, fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight: 1.6}}>
          Grade combines uptime, error rate, and tail-latency stability over the test window. Methodology →
        </div>
      )}
    </>
  );
}

function GeoMap({ large }) {
  // Approximate pixel coords on world-dot-map — these are eyeballed but plausible
  const pins = [
    { id: "us-east", x: "23%", y: "38%", region: "US East",      lat: 23,  win: true },
    { id: "us-west", x: "12%", y: "40%", region: "US West",      lat: 24,  win: true },
    { id: "eu",      x: "48%", y: "32%", region: "EU Central",   lat: 27,  win: true },
    { id: "ap",      x: "76%", y: "52%", region: "AP Southeast", lat: 32,  win: true },
  ];
  return (
    <div className="geo-shell" style={large ? { aspectRatio: "16/9", minHeight: 420 } : {}}>
      {pins.map(p => (
        <div key={p.id} className="geo-pin" style={{left: p.x, top: p.y}}>
          <div className="pin-dot"/>
          <div className="pin-card">
            <b>{p.region}</b>
            <span>Alchemy: <b style={{color:"var(--success-soft)"}}>{p.lat}ms</b></span>
            <span>vs. avg: 92ms</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShareCard() {
  return (
    <div>
      <div style={{textAlign:"center", marginBottom: 24, color:"rgba(255,255,255,0.6)"}}>
        Share this verdict — drops nicely into Slack, email, or your sales deck.
      </div>
      <div className="share-card">
        <div>
          <div style={{display:"flex", alignItems:"center", gap:10, marginBottom: 32}}>
            <AlchemyMark size={28}/>
            <span style={{fontSize:18, fontWeight:500}}>alchemy benchmarks</span>
          </div>
          <h2 className="share-card-h">Alchemy was <b>4.7× faster</b> on Polymarket's traffic.</h2>
        </div>
        <div className="share-card-stats">
          <div className="share-card-stat"><div className="v">23ms</div><div className="l">avg latency</div></div>
          <div className="share-card-stat"><div className="v">99.99%</div><div className="l">success rate</div></div>
          <div className="share-card-stat"><div className="v">5</div><div className="l">providers tested</div></div>
          <div className="share-card-stat"><div className="v">84,321</div><div className="l">replays</div></div>
        </div>
      </div>
      <div style={{display:"flex", gap:12, justifyContent:"center", marginTop: 24}}>
        <button className="btn btn-secondary">{I.download} Download PNG</button>
        <button className="btn btn-secondary">{I.share} Copy share link</button>
        <button className="btn btn-primary">Embed on site</button>
      </div>
    </div>
  );
}

// ─── HISTORY ────────────────────────────────────────────────────────────────
export function History({ setScreen }) {
  const runs = [
    { id: "BR-2026-05-07-3142", name: "polymarket-prod-2026-05-07.har",  date: "May 7 · 14:32", duration: "30 min", reqs: "84,321", verdict: "Alchemy 4.7× faster", verdictType: "win" },
    { id: "BR-2026-05-06-2877", name: "DeFi swap router preset",          date: "May 6 · 09:14", duration: "30 min", reqs: "60,002", verdict: "Alchemy 3.2× faster", verdictType: "win" },
    { id: "BR-2026-05-05-2614", name: "Pulled from app: prod-mainnet",    date: "May 5 · 16:48", duration: "2 hours", reqs: "612,840", verdict: "Alchemy 5.1× faster", verdictType: "win" },
    { id: "BR-2026-05-04-2398", name: "wallet-traffic-snapshot.json",     date: "May 4 · 11:02", duration: "30 min", reqs: "92,118",  verdict: "Alchemy 2.8× faster", verdictType: "win" },
    { id: "BR-2026-05-02-2102", name: "Onchain indexer preset",            date: "May 2 · 22:30", duration: "2 hours", reqs: "240,000", verdict: "Alchemy 6.4× faster", verdictType: "win" },
    { id: "BR-2026-04-29-1944", name: "nft-marketplace-staging.har",      date: "Apr 29 · 13:18", duration: "15 min", reqs: "28,400",  verdict: "Tied with Quicknode", verdictType: "tie" },
  ];
  return (
    <div className="container res-shell">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 32}}>
        <div>
          <div className="eyebrow on-dark" style={{marginBottom:8}}>Your benchmark history</div>
          <h1 style={{fontSize: 40, fontWeight: 600, letterSpacing:"-0.02em", margin: 0}}>6 runs · all-time win rate 5.0×</h1>
          <p className="run-sub" style={{marginTop: 8}}>Alchemy ranked #1 in 5 of 6 runs · weighted by your traffic mix</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setScreen("wizard")}>Run another {I.zap}</button>
      </div>

      <div className="counter-strip">
        <div className="counter-card hi">
          <div className="c-label">All-time win rate</div>
          <div className="c-value">5.0×</div>
          <div className="c-sub">avg speed advantage</div>
        </div>
        <div className="counter-card">
          <div className="c-label">Total replays</div>
          <div className="c-value">1.1M</div>
          <div className="c-sub">across all runs</div>
        </div>
        <div className="counter-card">
          <div className="c-label">Workloads tested</div>
          <div className="c-value">6</div>
          <div className="c-sub">3 imports · 3 presets</div>
        </div>
        <div className="counter-card">
          <div className="c-label">Best result</div>
          <div className="c-value">6.4×</div>
          <div className="c-sub">indexer workload · May 2</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Recent runs</h3>
          <div className="ctrl-row">
            <select className="field-input" style={{padding: "6px 10px", fontSize:13}}>
              <option>All sources</option>
              <option>Imported logs only</option>
              <option>API pulls only</option>
              <option>Presets only</option>
            </select>
          </div>
        </div>
        <table className="hist-table">
          <thead>
            <tr>
              <th>Run</th>
              <th>Workload</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Replays</th>
              <th>Verdict</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id} className="row-hover" onClick={() => setScreen("results")}>
                <td style={{fontFamily:"var(--font-mono)", fontSize:12, color:"rgba(255,255,255,0.6)"}}>{r.id}</td>
                <td style={{color:"#fff", fontWeight:500}}>{r.name}</td>
                <td style={{color:"rgba(255,255,255,0.7)"}}>{r.date}</td>
                <td style={{color:"rgba(255,255,255,0.7)"}}>{r.duration}</td>
                <td style={{fontVariantNumeric:"tabular-nums", color:"rgba(255,255,255,0.7)"}}>{r.reqs}</td>
                <td><span className={"pill " + r.verdictType}>{r.verdict}</span></td>
                <td style={{color:"rgba(255,255,255,0.5)", textAlign:"right"}}>{I.arrow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Running, Results, History, ShareCard });
