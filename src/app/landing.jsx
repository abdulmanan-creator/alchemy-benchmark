import React from "react";
import { PROVIDERS, METHODS, REGIONS, BASELINE, I, AlchemyMark, Sparkline, MultiLine, LiveRace } from "./data.jsx";
/* global React, PROVIDERS, METHODS, REGIONS, BASELINE, I, AlchemyMark, Sparkline, MultiLine, LiveRace */
const { useState, useEffect, useRef, useMemo } = React;

// ─── LANDING ────────────────────────────────────────────────────────────────
export function Landing({ heroVariant, copyTone, setScreen }) {
  return (
    <>
      {heroVariant === "split" && <HeroSplit setScreen={setScreen} copyTone={copyTone}/>}
      {heroVariant === "centered" && <HeroCentered setScreen={setScreen} copyTone={copyTone}/>}
      {heroVariant === "live-data" && <HeroLiveData setScreen={setScreen} copyTone={copyTone}/>}

      <LogoStrip/>
      <ThreeStep setScreen={setScreen}/>
      <Methodology copyTone={copyTone}/>
      <CtaBand setScreen={setScreen} copyTone={copyTone}/>
    </>
  );
}

function HeroSplit({ setScreen, copyTone }) {
  const tech = copyTone === "technical";
  return (
    <section className="bn-hero">
      <div className="bn-hero-bg"/>
      <div className="bn-hero-grid"/>
      <div className="container bn-hero-inner">
        <div style={{display:"grid", gridTemplateColumns:"1.05fr 1fr", gap:64, alignItems:"center"}}>
          <div>
            <span className="chip-on-dark"><span className="chip-dot"/> Live · running 5 providers · 4 regions · 7 chains</span>
            <h1 className="bn-hero-h1">
              {tech
                ? <>Benchmark your RPC traffic against <em>every</em> provider.</>
                : <>See exactly how fast Alchemy is on <em>your</em> traffic.</>}
            </h1>
            <p className="bn-hero-sub">
              {tech
                ? "Replay your real method mix across Alchemy, Infura, Quicknode, dRPC and Chainstack. Latency, success rate, geographic performance — measured in production conditions, not synthetic loops."
                : "Upload a log file, paste a method list, or pick a workload. We replay it against every major RPC provider and tell you who's actually fastest for what you do."}
            </p>
            <div className="bn-hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => setScreen("wizard")}>Run a benchmark {I.arrow}</button>
              <button className="btn btn-secondary btn-lg" onClick={() => setScreen("results")}>See a sample report</button>
            </div>
            <div className="bn-hero-meta">
              <span>{I.clock} 2 min sample · 30 min full run</span>
              <span>{I.shield} No code changes</span>
            </div>
          </div>
          <div>
            <HeroPreview/>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCentered({ setScreen, copyTone }) {
  const tech = copyTone === "technical";
  return (
    <section className="bn-hero">
      <div className="bn-hero-bg"/>
      <div className="bn-hero-grid"/>
      <div className="container bn-hero-inner" style={{textAlign:"center"}}>
        <span className="chip-on-dark" style={{margin:"0 auto 24px"}}><span className="chip-dot"/> Live · 5 providers · 4 regions · 7 chains</span>
        <h1 className="bn-hero-h1" style={{margin:"0 auto 24px", textAlign:"center"}}>
          {tech ? <>Benchmark your RPC traffic.<br/>On <em>your</em> methods.</> : <>Stop guessing.<br/><em>Measure</em> every RPC provider.</>}
        </h1>
        <p className="bn-hero-sub" style={{margin:"0 auto 40px"}}>
          {tech
            ? "Replay your real method mix across Alchemy, Infura, Quicknode, dRPC and Chainstack. Production conditions, four regions, real numbers."
            : "Upload your traffic. We replay it against every major provider in real production conditions, four regions, in two minutes."}
        </p>
        <div className="bn-hero-cta" style={{justifyContent:"center", marginBottom:64}}>
          <button className="btn btn-primary btn-lg" onClick={() => setScreen("wizard")}>Run a benchmark {I.arrow}</button>
          <button className="btn btn-secondary btn-lg" onClick={() => setScreen("results")}>See a sample report</button>
        </div>
        <HeroPreview wide/>
      </div>
    </section>
  );
}

function HeroLiveData({ setScreen, copyTone }) {
  const tech = copyTone === "technical";
  return (
    <section className="bn-hero">
      <div className="bn-hero-bg"/>
      <div className="bn-hero-grid"/>
      <div className="container bn-hero-inner">
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start"}}>
          <div>
            <span className="chip-on-dark"><span className="chip-dot"/> Streaming live</span>
            <h1 className="bn-hero-h1">
              {tech ? <>The numbers don't lie.<br/><em>Watch them live.</em></> : <>How fast is your RPC, <em>actually?</em></>}
            </h1>
            <p className="bn-hero-sub">
              {tech ? "Continuous benchmarks against five providers across four regions, every ten seconds, on real chains. Bring your own traffic to see numbers that match your workload."
                    : "We're benchmarking five providers right now. Watch it run, then bring your own traffic and see numbers tuned to your app."}
            </p>
            <div className="bn-hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => setScreen("wizard")}>Bring your traffic {I.arrow}</button>
              <button className="btn btn-secondary btn-lg" onClick={() => setScreen("results")}>See a sample report</button>
            </div>
          </div>
          <div className="hero-preview" style={{margin:0}}>
            <div className="hero-preview-frame">
              <div className="hero-preview-bar">
                <div className="dot-row"><i/><i/><i/></div>
                <span>benchmarks.alchemy.com — global · all methods · live</span>
              </div>
              <LiveRace running tone="live"/>
            </div>
          </div>
        </div>
        <div style={{marginTop: 64}}>
          <CounterStrip onDark/>
        </div>
      </div>
    </section>
  );
}

function HeroPreview({ wide }) {
  return (
    <div className="hero-preview" style={{margin: wide ? "0 auto" : 0, maxWidth: wide ? 980 : "none"}}>
      <div className="hero-preview-frame">
        <div className="hero-preview-bar">
          <div className="dot-row"><i/><i/><i/></div>
          <span>benchmarks.alchemy.com — your traffic vs. 4 competitors</span>
        </div>
        <LiveRace running tone="live"/>
      </div>
    </div>
  );
}

function CounterStrip({ onDark }) {
  const stats = [
    { v: "5", l: "providers benchmarked" },
    { v: "4", l: "global regions" },
    { v: "10s", l: "sample frequency" },
    { v: "99.99%", l: "Alchemy uptime" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: onDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--surface-200)", paddingTop: 32 }}>
      {stats.map((s,i) => (
        <div key={i} style={{ borderRight: i < 3 ? (onDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--surface-200)") : 0, padding: "0 24px", textAlign: i === 0 ? "left" : "center" }}>
          <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>{s.v}</div>
          <div style={{ fontSize: 13, color: onDark ? "rgba(255,255,255,0.5)" : "var(--fg-secondary)" }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function LogoStrip() {
  const logos = ["Visa","Circle","Polymarket","World","Stripe","Robinhood","Uniswap","OpenSea","Chainlink","Magic Eden","Aave"];
  return (
    <div className="logo-strip">
      <div className="logo-strip-track">
        {[...logos, ...logos, ...logos].map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

function ThreeStep({ setScreen }) {
  const steps = [
    { n: "01", h: "Bring your traffic", p: "Drop a HAR file, paste your method list, or connect via your Alchemy key — we'll detect your real method mix automatically.", icon: I.upload },
    { n: "02", h: "Run side-by-side", p: "We replay your traffic against Alchemy, Infura, Quicknode, dRPC, and Chainstack — across US East, US West, EU, and AP Southeast.", icon: I.zap },
    { n: "03", h: "Get a verdict", p: "Latency at p50/p95/p99, success rates, per-method breakdowns, geographic performance — and a shareable summary card.", icon: I.flag },
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="eyebrow on-dark">How it works</div>
        <h2 className="section-h" style={{maxWidth:720}}>From traffic file to verdict in 2 minutes.</h2>
        <p className="section-sub">No code changes, no prod traffic, no synthetic loops that don't match your workload.</p>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div className="step-card" key={i} onClick={() => setScreen("wizard")}>
              <div className="step-art">{s.icon}</div>
              <div className="step-n">{s.n}</div>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Methodology({ copyTone }) {
  const tech = copyTone === "technical";
  const items = [
    { h: "Real production traffic", p: tech ? "We replay your actual method mix and parameter distributions, not synthetic eth_blockNumber loops." : "We use your real workload — the methods you actually call, the way you call them." },
    { h: "Standard paid tier accounts", p: "Every provider is hit through a paid RPC service account on their default tier — no special arrangements, no insider access." },
    { h: "Geographic distribution", p: tech ? "Workers in AWS US East, US West, EU Central, and AP Southeast measure provider performance from where your users live." : "We test from four regions around the world, because your users aren't all sitting in Virginia." },
    { h: "Failure classification", p: tech ? "Non-200 HTTP, non-zero JSON-RPC error codes, and any response exceeding an 8s timeout are classified as failures." : "If a request returns an error, takes too long, or comes back wrong, we count it as a failure." },
    { h: "Public methodology", p: "Every benchmark report links to the exact request set, regions, and timing — we publish what we test." },
  ];
  return (
    <section className="section section-wash">
      <div className="container">
        <div className="method-grid">
          <div>
            <div className="eyebrow">Methodology</div>
            <h2 className="section-h" style={{color:"var(--ink)"}}>How we make it fair.</h2>
            <p className="section-sub">No marketing math. Standard accounts, real traffic, four regions, public methodology.</p>
            <div className="method-list">
              {items.map((it, i) => (
                <div className="method-item" key={i}>
                  <div className="check">{I.check}</div>
                  <div>
                    <h4>{it.h}</h4>
                    <p>{it.p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{position:"relative"}}>
            <img src={(window.__resources && window.__resources.illusReliability) || "assets/illus-reliability.png"} alt="" style={{width:"100%", borderRadius:24}}/>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand({ setScreen, copyTone }) {
  const tech = copyTone === "technical";
  return (
    <section className="cta-band">
      <h2 className="cta-h">{tech ? "Bring your traffic. See the numbers." : "Don't take our word for it."}</h2>
      <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", position:"relative"}}>
        <button className="btn btn-light btn-lg" onClick={() => setScreen("wizard")}>Run a benchmark {I.arrow}</button>
        <button className="btn btn-secondary btn-lg">Talk to an engineer</button>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer style={{borderTop: "1px solid var(--dark-border)", padding: "48px 0", color: "rgba(255,255,255,0.5)", fontSize: 13}}>
      <div className="container" style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <AlchemyMark size={24}/>
          <span style={{fontWeight: 500, color: "rgba(255,255,255,0.7)"}}>alchemy benchmarks</span>
          <span style={{marginLeft:16}}>© 2026 Alchemy Insights, Inc.</span>
        </div>
        <div style={{display:"flex", gap:24}}>
          <a>Methodology</a><a>Status</a><a>Docs</a><a>Privacy</a>
        </div>
      </div>
    </footer>
  );
}

// ─── WIZARD ─────────────────────────────────────────────────────────────────
export function Wizard({ wizardState, setWizardState, setScreen, walkthroughStyle }) {
  const { step } = wizardState;
  const steps = [
    { n: 1, name: "Import", desc: "Bring your traffic" },
    { n: 2, name: "Configure", desc: "Pick providers, regions" },
    { n: 3, name: "Review", desc: "Confirm and launch" },
  ];
  const setStep = (n) => setWizardState({ ...wizardState, step: n });
  return (
    <div className="wiz-shell">
      <aside className="wiz-side">
        <h3>New benchmark</h3>
        <div className="wiz-stepper">
          {steps.map(s => (
            <div key={s.n} className={"wiz-step " + (step === s.n ? "active" : step > s.n ? "done" : "")} onClick={() => setStep(s.n)}>
              <div className="wiz-step-num">{step > s.n ? I.check : s.n}</div>
              <div className="wiz-step-text">
                <div className="wiz-step-name">{s.name}</div>
                <div className="wiz-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop: 48, padding: 16, borderRadius: 12, background:"rgba(54,63,249,0.08)", border:"1px solid rgba(54,63,249,0.25)", fontSize: 13, color:"rgba(255,255,255,0.78)", lineHeight: 1.5}}>
          <div style={{display:"flex",alignItems:"center",gap:8, marginBottom:6, color:"var(--alchemy-cyan)", fontWeight: 500}}>
            {I.zap} Quick sample
          </div>
          We'll run a 2-min live sample first. Full run kicks off async after.
        </div>
      </aside>
      <main className="wiz-main">
        <div className="wiz-eyebrow">Step {step} of 3</div>
        {step === 1 && <WizStep1 wizardState={wizardState} setWizardState={setWizardState} setScreen={setScreen}/>}
        {step === 2 && <WizStep2 wizardState={wizardState} setWizardState={setWizardState} setScreen={setScreen}/>}
        {step === 3 && <WizStep3 wizardState={wizardState} setWizardState={setWizardState} setScreen={setScreen}/>}
      </main>
    </div>
  );
}

function WizStep1({ wizardState, setWizardState, setScreen }) {
  const { importMethod, importDone } = wizardState;
  const tabs = [
    { id: "upload", icon: I.upload, name: "Upload log file", desc: "HAR, JSON, or CSV from your dashboard" },
    { id: "paste",  icon: I.paste,  name: "Paste methods",   desc: "List of methods + relative weights" },
    { id: "api",    icon: I.api,    name: "Connect API key", desc: "Pull last 7 days from your Alchemy app" },
    { id: "preset", icon: I.preset, name: "Workload preset", desc: "DeFi, NFT, wallet, indexer templates" },
  ];
  const presets = [
    { id: "defi",   name: "DeFi swap router",  rps: "120 rps", chains: "Ethereum, Base", mix: "eth_call · 64% · receipts · 18%" },
    { id: "nft",    name: "NFT marketplace",   rps: "85 rps",  chains: "Ethereum, Polygon", mix: "getLogs · 41% · ownerOf · 22%" },
    { id: "wallet", name: "Wallet provider",   rps: "240 rps", chains: "8 chains", mix: "getBalance · 38% · receipts · 22%" },
    { id: "index",  name: "Onchain indexer",   rps: "60 rps",  chains: "Optimism, Arbitrum", mix: "getLogs · 78%" },
    { id: "game",   name: "Onchain game",      rps: "180 rps", chains: "Base, Polygon", mix: "eth_call · 55% · sendTx · 12%" },
    { id: "infra",  name: "Block explorer",    rps: "320 rps", chains: "All", mix: "getBlockByNumber · 45%" },
  ];
  return (
    <div>
      <h1 className="wiz-h2">Bring your traffic.</h1>
      <p className="wiz-sub">Pick the easiest way to give us a representative slice of your workload. Most teams start with a paste or a preset, then upload a HAR after the sample run.</p>

      <div className="imp-tabs">
        {tabs.map(t => (
          <button key={t.id} className={"imp-tab" + (importMethod === t.id ? " active" : "")} onClick={() => setWizardState({ ...wizardState, importMethod: t.id, importDone: t.id === "preset" ? importDone : false })}>
            <div className="imp-tab-icon">{t.icon}</div>
            <div className="imp-tab-name">{t.name}</div>
            <div className="imp-tab-desc">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="imp-body">
        {importMethod === "upload" && (
          <>
            {!importDone ? (
              <div className="imp-drop" onClick={() => setWizardState({ ...wizardState, importDone: true, detected: { name: "polymarket-prod-2026-05-07.har", reqs: 84321, methods: 9, span: "6h 14m" }, sourceLabel: "Uploaded HAR" })}>
                <div className="imp-drop-icon">{I.upload}</div>
                <h4>Drop a HAR or JSON log here</h4>
                <p>Or click to browse · Max 200MB · We strip params before storage</p>
              </div>
            ) : (
              <DetectedSummary data={wizardState.detected}/>
            )}
            <div style={{display:"flex", gap:12, marginTop:16, fontSize:12, color:"rgba(255,255,255,0.5)"}}>
              <span>Supported: HAR · NDJSON · CSV · curl logs</span>
              <span style={{marginLeft:"auto"}}>How to capture a HAR →</span>
            </div>
          </>
        )}
        {importMethod === "paste" && (
          <PasteMethods onParse={(d) => setWizardState({ ...wizardState, importDone: true, detected: d, sourceLabel: "Pasted methods" })} done={importDone} detected={wizardState.detected}/>
        )}
        {importMethod === "api" && (
          <ApiConnect onConnect={(d) => setWizardState({ ...wizardState, importDone: true, detected: d, sourceLabel: "Pulled from app: prod-mainnet" })} done={importDone} detected={wizardState.detected}/>
        )}
        {importMethod === "preset" && (
          <div className="preset-grid">
            {presets.map(p => (
              <button key={p.id} className={"preset-card" + (wizardState.preset === p.id ? " active" : "")} onClick={() => setWizardState({ ...wizardState, preset: p.id, importDone: true, detected: { name: p.name, reqs: 50000, methods: 7, span: "synthetic" }, sourceLabel: "Preset: " + p.name })}>
                <div className="preset-name">{p.name}</div>
                <div className="preset-mix">{p.mix}</div>
                <div className="preset-meta"><span>{p.rps}</span><span>{p.chains}</span></div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="wiz-footer">
        <button className="btn btn-ghost" onClick={() => setScreen("landing")}>← Back to overview</button>
        <button className="btn btn-primary" disabled={!importDone} style={{opacity: importDone ? 1 : 0.4}} onClick={() => setWizardState({ ...wizardState, step: 2 })}>Continue {I.arrow}</button>
      </div>
    </div>
  );
}

function PasteMethods({ onParse, done, detected }) {
  const [val, setVal] = useState("eth_getBalance       42%\neth_getBlockByNumber 18%\neth_getLogs          16%\neth_call             14%\neth_getTransactionReceipt  10%");
  return (
    <div>
      <textarea className="imp-paste" value={val} onChange={e => setVal(e.target.value)} placeholder="eth_getBalance  42%&#10;eth_getLogs     16%"/>
      {!done && (
        <div style={{display:"flex", gap:12, marginTop:16}}>
          <button className="btn btn-secondary btn-sm" onClick={() => onParse({ name: "Pasted method mix", reqs: 0, methods: val.split('\n').filter(l => l.trim()).length, span: "—" })}>Parse method list</button>
          <span style={{color:"rgba(255,255,255,0.5)", fontSize: 12, alignSelf:"center"}}>One method per line · weight as % or count</span>
        </div>
      )}
      {done && <DetectedSummary data={detected}/>}
    </div>
  );
}

function ApiConnect({ onConnect, done, detected }) {
  const [key, setKey] = useState("alch_••••••••••••••••••••••••AbCd");
  return (
    <div>
      <div className="field" style={{marginBottom:16}}>
        <label className="field-label">Alchemy API key</label>
        <input className="field-input" value={key} onChange={e => setKey(e.target.value)}/>
        <div className="field-help">We'll fetch the last 7 days of method counts. We don't read parameter values.</div>
      </div>
      <div className="field" style={{marginBottom:16}}>
        <label className="field-label">Sample app</label>
        <select className="field-input">
          <option>prod-mainnet (8.4M req/day)</option>
          <option>prod-base (2.1M req/day)</option>
          <option>staging-eth (180k req/day)</option>
        </select>
      </div>
      {!done && <button className="btn btn-primary btn-sm" onClick={() => onConnect({ name: "prod-mainnet · last 7 days", reqs: 58800000, methods: 12, span: "7 days" })}>Pull traffic snapshot</button>}
      {done && <DetectedSummary data={detected}/>}
    </div>
  );
}

function DetectedSummary({ data }) {
  if (!data) return null;
  return (
    <div className="detected">
      <div className="detected-icon">{I.check}</div>
      <div className="detected-text">
        <strong>Detected · {data.name}</strong>
        <span>Method mix and parameter shape ready to replay.</span>
      </div>
      <div className="detected-meta">
        <div><b>{data.reqs ? data.reqs.toLocaleString() : "—"}</b><br/>requests</div>
        <div><b>{data.methods}</b><br/>methods</div>
        <div><b>{data.span}</b><br/>span</div>
      </div>
    </div>
  );
}

function WizStep2({ wizardState, setWizardState, setScreen }) {
  const toggle = (key, val) => {
    const arr = wizardState[key];
    setWizardState({ ...wizardState, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };
  const chains = ["Ethereum", "Optimism", "Arbitrum", "Base", "Polygon", "BNB"];
  return (
    <div>
      <h1 className="wiz-h2">Configure the run.</h1>
      <p className="wiz-sub">We've prefilled sane defaults from your detected workload. Toggle anything you don't want to test.</p>

      <div style={{display:"flex", flexDirection:"column", gap: 32}}>
        <div className="field">
          <label className="field-label">Providers to compare</label>
          <div className="field-help">Alchemy is always included. Pick competitors to benchmark against.</div>
          <div className="checkbox-grid cols-3" style={{marginTop:8}}>
            {PROVIDERS.map(p => (
              <div key={p.id} className={"cbox" + ((wizardState.providers.includes(p.id) || p.isUs) ? " on" : "")} onClick={() => !p.isUs && toggle("providers", p.id)} style={p.isUs ? {opacity: 0.95, cursor:"default"} : {}}>
                <div className="cbox-square">{(wizardState.providers.includes(p.id) || p.isUs) && I.check}</div>
                <span style={{flex:1}}>{p.name}</span>
                <i style={{ width:8, height:8, borderRadius:"50%", background: p.color }}/>
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Chains</label>
          <div className="checkbox-grid cols-3" style={{marginTop:8}}>
            {chains.map(c => (
              <div key={c} className={"cbox" + (wizardState.chains.includes(c) ? " on" : "")} onClick={() => toggle("chains", c)}>
                <div className="cbox-square">{wizardState.chains.includes(c) && I.check}</div>
                <span style={{flex:1}}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Regions</label>
          <div className="field-help">Workers in each region replay your traffic in parallel.</div>
          <div className="checkbox-grid cols-2" style={{marginTop:8}}>
            {REGIONS.map(r => (
              <div key={r.id} className={"cbox" + (wizardState.regions.includes(r.id) ? " on" : "")} onClick={() => toggle("regions", r.id)}>
                <div className="cbox-square">{wizardState.regions.includes(r.id) && I.check}</div>
                <span>{r.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="field-grid cols-2">
          <div className="field">
            <label className="field-label">Sample duration</label>
            <select className="field-input" value={wizardState.duration} onChange={e => setWizardState({ ...wizardState, duration: e.target.value })}>
              <option>2 minutes (live preview)</option>
              <option>15 minutes</option>
              <option>30 minutes (recommended)</option>
              <option>2 hours (async)</option>
              <option>24 hours (async)</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Concurrency</label>
            <select className="field-input">
              <option>Match detected (84 rps)</option>
              <option>Half (42 rps)</option>
              <option>2× (168 rps)</option>
              <option>Burst test (3× spikes)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="wiz-footer">
        <button className="btn btn-ghost" onClick={() => setWizardState({ ...wizardState, step: 1 })}>← Back</button>
        <button className="btn btn-primary" onClick={() => setWizardState({ ...wizardState, step: 3 })}>Continue {I.arrow}</button>
      </div>
    </div>
  );
}

function WizStep3({ wizardState, setWizardState, setScreen }) {
  const providerCount = (wizardState.providers.length || 0) + 1; // +Alchemy
  return (
    <div>
      <h1 className="wiz-h2">Ready to run.</h1>
      <p className="wiz-sub">A 2-minute live sample starts immediately. The full run continues in the background — we'll email you when it's done.</p>

      <div className="review-grid">
        <div className="review-card">
          <h5>Workload</h5>
          <div className="review-row"><span>Source</span><b>{wizardState.sourceLabel || "Preset"}</b></div>
          <div className="review-row"><span>Detected</span><b>{wizardState.detected?.name || "—"}</b></div>
          <div className="review-row"><span>Methods</span><b>{wizardState.detected?.methods || 7}</b></div>
          <div className="review-row"><span>Sample size</span><b>{(wizardState.detected?.reqs || 50000).toLocaleString()} replays</b></div>
        </div>
        <div className="review-card">
          <h5>Run</h5>
          <div className="review-row"><span>Providers</span><b>{providerCount} ({PROVIDERS.filter(p => p.isUs || wizardState.providers.includes(p.id)).map(p => p.name).join(", ")})</b></div>
          <div className="review-row"><span>Chains</span><b>{wizardState.chains.join(", ")}</b></div>
          <div className="review-row"><span>Regions</span><b>{wizardState.regions.length}</b></div>
          <div className="review-row"><span>Duration</span><b>{wizardState.duration}</b></div>
        </div>
      </div>

      <div style={{marginTop: 24, padding: "16px 20px", border: "1px solid rgba(54,63,249,0.25)", background:"rgba(54,63,249,0.06)", borderRadius:12, display:"flex", alignItems:"center", gap: 14}}>
        {I.shield}
        <div style={{fontSize: 13, color:"rgba(255,255,255,0.85)", lineHeight: 1.5}}>
          <strong style={{display:"block", marginBottom:2}}>Methodology check</strong>
          We hit each provider through their <em>standard paid tier</em>. No insider arrangements, no special endpoints — same API key any customer would buy.
        </div>
      </div>

      <div className="wiz-footer">
        <button className="btn btn-ghost" onClick={() => setWizardState({ ...wizardState, step: 2 })}>← Back</button>
        <div style={{display:"flex", gap:12}}>
          <button className="btn btn-secondary" onClick={() => setScreen("landing")}>Save draft</button>
          <button className="btn btn-primary" onClick={() => setScreen("running")}>Launch benchmark {I.zap}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Landing, Wizard, LiveRace });
