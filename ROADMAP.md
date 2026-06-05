# Roadmap

Where this project is, and the path from "deployable frontend prototype" to "real
benchmark product."

## Where we are today

The standalone HTML demo has been extracted into a real, editable Vite + React app
(see `README.md`). That work delivered the **presentation layer** and a deployable
static site — roughly **25–35% of the frontend surface and ~0–5% of the benchmark
platform**. Everything below the glass (ingestion, execution, methodology, storage)
is still synthetic.

The whole results experience is driven by one hardcoded constant, `BASELINE`
(`src/app/data.jsx:32`, "Alchemy fastest by design"). The "Running" screen is a 24s
`setInterval` + `Math.random()` simulation (`src/app/results.jsx:15`). All three
wizard intake paths are canned (`src/app/landing.jsx:341`, `:389`, `:415`). History
is a literal array (`src/app/results.jsx:622`).

## Layer status

| # | Layer | Status | Notes |
|---|-------|--------|-------|
| 1 | App foundation | 🟡 Partial | React app + build + deploy config. No backend, auth, orgs, projects, or persistence. "Sign in" is decorative. |
| 2 | Workload ingestion | 🔴 None | No HAR/JSON/CSV parsers; intake is mocked. No normalization or redaction. |
| 3 | Benchmark runner | 🔴 None | No workers, queue, provider adapters, or replay. |
| 4 | Fairness & methodology | 🔴 Copy only | Marketing text exists; no implementation, no auditable artifact. |
| 5 | Data model | 🔴 None | Single `BASELINE` constant; no DB, no raw-vs-derived separation. |
| 6 | Results & sharing | 🟡 UI shell | Charts render from static data. Export/share buttons are inert. |
| 7 | Security | 🔴 None | Nothing handling uploads, secrets, tenants, or egress yet. |
| 8 | Operational controls | 🔴 None | No quotas, cost estimation, cancellation, observability, billing. |
| 9 | Product surface | 🟡 1 of 3 (mockup) | "Quick compare" exists visually; "Verified benchmark" and "Continuous monitor" do not. |

## Milestone sequence

The hard part is not the UI — it is benchmark credibility, safe ingestion, regional
execution, and defensible reporting. The plan front-loads a thin end-to-end slice so
real data flows before we invest in breadth.

- **M1 — Real measurement, end to end (next).** Paste a method list → create a
  `BenchmarkRun` → run a small controlled RPC replay against two real providers from
  one region → persist raw observations → render the existing Results/History UI from
  real data instead of `BASELINE`/`Math.random()`. Design: **[`docs/milestone-1-real-benchmark.md`](docs/milestone-1-real-benchmark.md)**.
- **M2 — Real ingestion.** HAR/JSON/CSV parsers, a normalized workload model
  (method, chain, params shape, weight, rate, region), and aggressive secret/payload
  redaction. (Layer 2)
- **M3 — Defensible methodology.** Paid-tier accounts, fixed request sets, warmup,
  retry/timeout policy, percentile math + confidence intervals, head-lag/finality,
  and a published methodology artifact attached to every report. (Layer 4)
- **M4 — Execution at scale.** Real queue + job orchestration, multi-region workers,
  concurrency/rate-limit controls, cancellation, resumability, worker observability.
  (Layers 3, 8)
- **M5 — Accounts & sharing.** Auth, orgs/projects, persisted history, public/private
  share links, PDF/PNG/CSV/raw exports, Slack/email. (Layers 1, 6)
- **M6 — Security & ops hardening.** Tenant isolation, secret storage, file scanning,
  scoped credentials, audit logs, egress controls, quotas, cost estimation, billing
  hooks. (Layers 7, 8)
- **M7 — Three product modes.** Quick compare / Verified benchmark / Continuous
  monitor with scheduling and alerts. (Layer 9)

## Decisions locked for M1

- **Providers:** public/free endpoints (free Alchemy key + dRPC's public endpoint).
  Proves the pipeline; **not** a fair paid-tier comparison — recorded as a caveat on
  every run.
- **Persistence:** Render Postgres (free tier), raw observations kept separate from
  derived metrics for auditability.
- **Runner:** in-process (no Redis/queue yet), single region (= Render's region).
