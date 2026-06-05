import React from "react";
import ReactDOM from "react-dom/client";
import "../styles.css";
import { I, AlchemyMark, TopNav } from "./data.jsx";
import { Landing, Wizard } from "./landing.jsx";
import { Running, Results, History } from "./results.jsx";
import { useTweaks, TweaksPanel, TweakSection, TweakRadio } from "./tweaks.jsx";

// Seed the resource map the landing illustration reads (was injected by the bundler at runtime).
window.__resources = Object.assign({}, window.__resources, { illusReliability: "/assets/illus-reliability.png" });


const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "split",
  "walkthroughStyle": "wizard",
  "resultsLayout": "verdict",
  "density": "comfortable",
  "copyTone": "plainspoken",
  "heroIntensity": "default"
}/*EDITMODE-END*/;

// ── Empty state ──────────────────────────────────────────────────────────
function EmptyState({ setScreen }) {
  return (
    <div className="container" style={{padding:"96px 32px", textAlign:"center"}}>
      <div style={{
        width:88, height:88, margin:"0 auto 24px",
        borderRadius:24, background:"linear-gradient(135deg, rgba(54,63,249,0.18), rgba(108,92,231,0.12))",
        border:"1px solid rgba(54,63,249,0.32)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{color:"var(--accent)"}}>{I.zap}</div>
      </div>
      <div className="eyebrow on-dark" style={{marginBottom:8}}>No runs yet</div>
      <h1 style={{fontSize:44, fontWeight:600, letterSpacing:"-0.02em", margin:"0 0 16px"}}>Run your first benchmark</h1>
      <p style={{fontSize:18, color:"rgba(255,255,255,0.65)", maxWidth:540, margin:"0 auto 32px"}}>
        Bring your real traffic — a HAR file, a method list, or your Alchemy app key — and we'll race it against Infura, Quicknode, dRPC and Chainstack across four regions.
      </p>
      <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:64}}>
        <button className="btn btn-primary btn-lg" onClick={() => setScreen("wizard")}>Run a benchmark {I.arrow}</button>
        <button className="btn btn-secondary btn-lg" onClick={() => setScreen("results")}>See sample report</button>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, maxWidth:920, margin:"0 auto", textAlign:"left"}}>
        {[
          { title: "Upload a log", body: "Drop a HAR or JSON capture from your dashboard.", icon: I.upload },
          { title: "Connect an app", body: "We'll pull the last 7 days of method mix automatically.", icon: I.api },
          { title: "Pick a preset", body: "DeFi, NFT, wallet, or indexer workload templates.", icon: I.preset },
        ].map((c,i) => (
          <button key={i} onClick={() => setScreen("wizard")} className="step-card" style={{cursor:"pointer", textAlign:"left"}}>
            <div className="step-art">{c.icon}</div>
            <div style={{fontWeight:500, fontSize:16, marginBottom:4, color:"#fff"}}>{c.title}</div>
            <div style={{fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.5}}>{c.body}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Walkthrough overlays ─────────────────────────────────────────────────
function SidePanelGuide({ screen, dismiss }) {
  const content = {
    landing:  { title: "Quick tour", body: "Welcome. Click Run a benchmark to bring your traffic, configure providers, and see the head-to-head. About 3 minutes." , next: "Got it" },
    wizard:   { title: "Bring your real traffic", body: "Upload a HAR file, paste methods, connect via API key, or pick a preset. Anything that reflects your actual workload." , next: "Got it" },
    running:  { title: "What you're seeing", body: "Each provider is replaying your traffic from four regions in parallel. The race below shows latency in real time." , next: "Got it" },
    results:  { title: "Reading the verdict", body: "Tabs slice the same run by latency, reliability, region, or method. The Share tab generates a card you can drop in Slack or a deck." , next: "Got it" },
  };
  const c = content[screen];
  if (!c) return null;
  return (
    <div className="side-guide">
      <div className="side-guide-h">
        <div className="eyebrow" style={{color:"var(--accent)"}}>Walkthrough</div>
        <button className="side-guide-x" onClick={dismiss}>{I.close}</button>
      </div>
      <h4>{c.title}</h4>
      <p>{c.body}</p>
      <div style={{display:"flex", gap:8, marginTop:16}}>
        <button className="btn btn-primary btn-sm" onClick={dismiss}>{c.next}</button>
        <button className="btn btn-ghost btn-sm" onClick={dismiss}>Skip tour</button>
      </div>
      <div className="side-guide-prog">
        <span>{ {landing:1, wizard:2, running:3, results:4}[screen] || 1 } of 4</span>
        <div className="side-guide-dots">
          {[1,2,3,4].map(n => <i key={n} className={n === ({landing:1, wizard:2, running:3, results:4}[screen] || 1) ? "active" : ""}/>)}
        </div>
      </div>
    </div>
  );
}

function CoachmarkGuide({ screen, dismiss }) {
  const targets = {
    landing: { sel: ".bn-hero-cta button", text: "Click here to bring your traffic and start a benchmark.", pos: "bottom" },
    wizard:  { sel: ".imp-tabs", text: "Pick how to bring in your traffic — log file, paste, API, or preset.", pos: "bottom" },
    running: { sel: ".counter-strip", text: "Live numbers update as your traffic replays.", pos: "bottom" },
    results: { sel: ".res-tabs", text: "Slice the same run by latency, reliability, region, method, or share.", pos: "bottom" },
  };
  const t = targets[screen];
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!t) return;
    const el = document.querySelector(t.sel);
    if (!el) { setPos(null); return; }
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 12, left: r.left + window.scrollX, width: r.width });
  }, [screen]);
  if (!t || !pos) return null;
  return (
    <>
      <div className="coach-spot" style={{ top: pos.top - 16 - (t.pos === "bottom" ? 12 : 0), left: pos.left - 8, width: pos.width + 16, height: 4 }}/>
      <div className="coachmark" style={{ top: pos.top, left: pos.left }}>
        <div className="coach-arrow"/>
        <p>{t.text}</p>
        <div style={{display:"flex", gap:8, marginTop:8}}>
          <button className="btn btn-primary btn-sm" onClick={dismiss}>Got it</button>
          <button className="btn btn-ghost-light btn-sm" onClick={dismiss}>Skip</button>
        </div>
      </div>
    </>
  );
}

// ── Tweaks ───────────────────────────────────────────────────────────────
function TweaksPanelUI({ tweaks, setTweak, dismiss }) {
  return (
    <TweaksPanel onClose={dismiss}>
      <TweakSection title="Hero / landing">
        <TweakRadio label="Hero variant" value={tweaks.heroVariant} options={[
          {value:"split", label:"Split"}, {value:"centered", label:"Centered"}, {value:"live-data", label:"Live data"}
        ]} onChange={v => setTweak("heroVariant", v)}/>
        <TweakSelect label="Hero intensity" value={tweaks.heroIntensity} options={[
          {value:"default", label:"Default"}, {value:"minimal", label:"Minimal glow"}, {value:"bold", label:"Bold violet"},
        ]} onChange={v => setTweak("heroIntensity", v)}/>
      </TweakSection>
      <TweakSection title="Walkthrough">
        <TweakRadio label="Style" value={tweaks.walkthroughStyle} options={[
          {value:"wizard", label:"Wizard"}, {value:"side-panel", label:"Side panel"}, {value:"coachmarks", label:"Tooltips"},
        ]} onChange={v => setTweak("walkthroughStyle", v)}/>
      </TweakSection>
      <TweakSection title="Results dashboard">
        <TweakRadio label="Layout" value={tweaks.resultsLayout} options={[
          {value:"verdict", label:"Verdict"}, {value:"parity", label:"Parity"}, {value:"detailed", label:"Detail"}
        ]} onChange={v => setTweak("resultsLayout", v)}/>
        <TweakRadio label="Density" value={tweaks.density} options={[
          {value:"comfortable", label:"Comfy"}, {value:"compact", label:"Compact"}
        ]} onChange={v => setTweak("density", v)}/>
      </TweakSection>
      <TweakSection title="Voice">
        <TweakRadio label="Copy tone" value={tweaks.copyTone} options={[
          {value:"plainspoken", label:"Plainspoken"}, {value:"technical", label:"Technical"}
        ]} onChange={v => setTweak("copyTone", v)}/>
      </TweakSection>
    </TweaksPanel>
  );
}

// ── Root app ─────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useState("landing");
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [walkOpen, setWalkOpen] = useState(false);

  // Edit mode wiring: register listener, then announce availability
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({type: "__edit_mode_available"}, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const [wizardState, setWizardState] = useState({
    step: 1,
    importMethod: "upload",
    importDone: false,
    detected: null,
    sourceLabel: "",
    preset: null,
    providers: ["infura", "quicknode", "drpc", "chainstack"],
    chains: ["Ethereum", "Optimism", "Base"],
    regions: ["us-east", "us-west", "eu", "ap"],
    duration: "2 minutes (live preview)",
    runMode: "both",
  });

  // Apply density tweak via root attribute
  useEffect(() => {
    document.documentElement.dataset.density = tweaks.density;
    document.documentElement.dataset.heroIntensity = tweaks.heroIntensity;
  }, [tweaks.density, tweaks.heroIntensity]);

  // Show walk overlay automatically on certain screens (only if user hasn't dismissed)
  useEffect(() => {
    if (tweaks.walkthroughStyle === "wizard") setWalkOpen(false);
    else setWalkOpen(true);
  }, [screen, tweaks.walkthroughStyle]);

  const navProps = { screen, setScreen };

  return (
    <div className="app-shell" data-screen-label={"00 " + screen}>
      <TopNav {...navProps}/>

      {screen === "landing" && <Landing heroVariant={tweaks.heroVariant} copyTone={tweaks.copyTone} setScreen={setScreen}/>}
      {screen === "empty"   && <EmptyState setScreen={setScreen}/>}
      {screen === "wizard"  && <Wizard wizardState={wizardState} setWizardState={setWizardState} setScreen={setScreen} walkthroughStyle={tweaks.walkthroughStyle}/>}
      {screen === "running" && <Running wizardState={wizardState} setScreen={setScreen}/>}
      {screen === "results" && <Results resultsLayout={tweaks.resultsLayout} setScreen={setScreen}/>}
      {screen === "history" && <History setScreen={setScreen}/>}

      {/* Walkthrough overlays */}
      {tweaks.walkthroughStyle === "side-panel" && walkOpen && (
        <SidePanelGuide screen={screen} dismiss={() => setWalkOpen(false)}/>
      )}
      {tweaks.walkthroughStyle === "coachmarks" && walkOpen && (
        <CoachmarkGuide screen={screen} dismiss={() => setWalkOpen(false)}/>
      )}

      {/* Tweaks panel */}
      {tweaksOpen && <TweaksPanelUI tweaks={tweaks} setTweak={setTweak} dismiss={() => { setTweaksOpen(false); window.parent.postMessage({type:"__edit_mode_dismissed"}, "*"); }}/>}

      {/* Site footer (only on landing) */}
      {screen === "landing" && <SiteFooter/>}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer style={{borderTop:"1px solid var(--dark-border)", padding:"56px 0 40px", marginTop: 40}}>
      <div className="container" style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 32, flexWrap:"wrap"}}>
        <div style={{display:"flex", flexDirection:"column", gap:12, maxWidth: 360}}>
          <div className="bn-brand"><AlchemyMark size={28}/><span>alchemy</span><span className="b-tag">benchmarks</span></div>
          <p style={{fontSize:13, color:"rgba(255,255,255,0.55)", margin:0, lineHeight:1.6}}>The complete blockchain developer platform trusted by leading fintechs and developers worldwide.</p>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 56}}>
          <div>
            <div style={{fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)", marginBottom:14}}>Product</div>
            <div style={{display:"flex", flexDirection:"column", gap:10, fontSize:13, color:"rgba(255,255,255,0.78)"}}>
              <a style={{color:"inherit", textDecoration:"none"}}>Node RPC</a>
              <a style={{color:"inherit", textDecoration:"none"}}>Webhooks</a>
              <a style={{color:"inherit", textDecoration:"none"}}>Smart Wallets</a>
            </div>
          </div>
          <div>
            <div style={{fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)", marginBottom:14}}>Benchmarks</div>
            <div style={{display:"flex", flexDirection:"column", gap:10, fontSize:13, color:"rgba(255,255,255,0.78)"}}>
              <a style={{color:"inherit", textDecoration:"none"}}>Methodology</a>
              <a style={{color:"inherit", textDecoration:"none"}}>Public dashboard</a>
              <a style={{color:"inherit", textDecoration:"none"}}>API</a>
            </div>
          </div>
          <div>
            <div style={{fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)", marginBottom:14}}>Company</div>
            <div style={{display:"flex", flexDirection:"column", gap:10, fontSize:13, color:"rgba(255,255,255,0.78)"}}>
              <a style={{color:"inherit", textDecoration:"none"}}>About</a>
              <a style={{color:"inherit", textDecoration:"none"}}>Careers</a>
              <a style={{color:"inherit", textDecoration:"none"}}>Contact</a>
            </div>
          </div>
        </div>
      </div>
      <div className="container" style={{borderTop:"1px solid var(--dark-border)", marginTop: 40, paddingTop: 24, display:"flex", justifyContent:"space-between", fontSize: 12, color:"rgba(255,255,255,0.45)"}}>
        <span>© 2026 Alchemy Insights, Inc.</span>
        <span>benchmarks.alchemy.com</span>
      </div>
    </footer>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
