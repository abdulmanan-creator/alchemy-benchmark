# M1 — Real measurement, end to end

**Status:** design (no code yet). This is the smallest slice that replaces synthetic
data with a real, auditable measurement across the full path.

## Goal / definition of done

A user pastes a method list, clicks **Launch benchmark**, and the existing Running →
Results → History screens render **real latency** measured from live RPC calls — with
the raw measurements persisted and queryable.

Done when:
1. `POST /api/runs` creates a `BenchmarkRun`, runs a controlled replay against
   **Alchemy** and **dRPC**, and persists raw observations + derived metrics.
2. The Running screen reflects real progress; Results shows real p50/p95/p99 +
   success rate; History lists real past runs — all from Postgres, not `BASELINE`.
3. Every run stores a methodology record (request set, sample size, region, endpoint
   identity, caveats) so a result is auditable after the fact.

## Scope

**In:** one intake path (paste), two real providers, one region, in-process runner,
Postgres persistence, real Results/History.

**Out (later milestones):** auth/orgs, HAR/JSON/CSV parsing, multi-region workers,
queue/Redis, exports (PDF/PNG/share links), quotas/billing, >2 providers, confidence
intervals, finality/head-lag. These are explicitly deferred.

## Architecture

```
Browser (existing React app)
  │  POST /api/runs        {workload, providers, sampleSize}
  │  GET  /api/runs/:id     (poll for status + metrics)
  │  GET  /api/runs         (history)
  ▼
Node web service (server/, Fastify)        ← also serves the built dist/
  ├─ run controller: validate → insert run(status=queued) → start runner (async)
  ├─ runner (in-process): replay workload, write observations as they land
  ├─ metrics: derive p50/p95/p99 + success from observations, persist
  └─ Postgres (Render free tier): runs / observations / metrics
        │
        └─ outbound JSON-RPC ──► Alchemy (free key) , dRPC (public endpoint)
```

Single deployable: the Node service serves the static `dist/` build *and* the `/api`
routes, so there is one Render web service + one Postgres database.

## Data model (Postgres)

Raw observations are kept separate from derived metrics so results are auditable and
re-derivable.

```sql
create type run_status as enum ('queued','running','done','error');

create table runs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        run_status  not null default 'queued',
  name          text,                       -- e.g. "Pasted method mix · 6 methods"
  workload      jsonb       not null,       -- normalized: {methods:[{name,weight}]}
  providers     text[]      not null,       -- ['alchemy','drpc']
  region        text        not null,       -- render region id, e.g. 'oregon'
  sample_size   int         not null,       -- samples per method per provider
  methodology   jsonb       not null,       -- request set, warmup, timeout, caveats
  error         text
);

create table observations (
  id                  bigserial primary key,
  run_id              uuid not null references runs(id) on delete cascade,
  provider            text not null,
  method              text not null,
  sample_idx          int  not null,
  is_warmup           boolean not null default false,
  started_at          timestamptz not null,
  latency_ms          numeric,              -- null if the request never returned
  ok                  boolean not null,     -- 200 + no jsonrpc error + within timeout
  http_status         int,
  jsonrpc_error_code  int
);
create index on observations (run_id, provider, method);

create table metrics (
  id            bigserial primary key,
  run_id        uuid not null references runs(id) on delete cascade,
  provider      text not null,
  method        text,                       -- null => 'overall' scope
  scope         text not null,              -- 'overall' | 'per_method'
  avg           numeric,
  p50           numeric,
  p95           numeric,
  p99           numeric,
  success_rate  numeric,                    -- 0..1
  sample_count  int not null
);
create index on metrics (run_id, provider);
```

## API contract

### `POST /api/runs`
```jsonc
// request
{
  "workload": { "rawText": "eth_blockNumber\neth_getBalance\neth_getLogs" },
  "providers": ["alchemy", "drpc"],   // M1: ignored beyond these two
  "sampleSize": 30
}
// 201
{ "id": "…uuid…", "status": "queued" }
```
Server normalizes `rawText` → `{methods:[{name,weight}]}`, intersects with the M1
**method allowlist** (below), rejects empty/oversized input.

### `GET /api/runs/:id`
```jsonc
{
  "id": "…", "status": "running", "progress": 0.62,
  "providers": ["alchemy","drpc"],
  "methodology": { "sampleSize": 30, "warmup": 3, "timeoutMs": 8000, "region": "oregon",
                   "endpoints": { "alchemy": "eth-mainnet.g.alchemy.com", "drpc": "eth.drpc.org" },
                   "caveats": ["public/free endpoints, not paid-tier", "single region"] },
  // present once status === 'done':
  "metrics": {
    "byProvider": {
      "alchemy": { "avg": 41, "p50": 38, "p95": 92, "p99": 140, "success": 99.9, "errs": 1 },
      "drpc":    { "avg": 110, "p50": 96, "p95": 280, "p99": 410, "success": 99.2, "errs": 7 }
    }
  }
}
```
`byProvider` is **shape-compatible with `BASELINE`** so existing chart code works
with minimal change.

### `GET /api/runs`
Returns recent runs for History: `[{ id, created_at, name, verdict, providers, reqs }]`,
where `verdict` is derived ("Alchemy 2.7× faster" / "Tied").

## Runner methodology (M1)

The fairness work is M3; M1 only needs to be **honest and reproducible**, with caveats
recorded. Rules:

- **Providers / endpoints:** `alchemy` → `ALCHEMY_RPC_URL` (free key), `drpc` →
  `DRPC_RPC_URL` (default `https://eth.drpc.org`, public). Both are real Ethereum
  mainnet endpoints and both already exist in `PROVIDERS`.
- **Method allowlist:** read-only methods with deterministic, identical params across
  providers — `eth_blockNumber`, `eth_getBalance`, `eth_getBlockByNumber`, `eth_call`,
  `eth_getTransactionReceipt`, `eth_getLogs`. Methods outside this list are dropped for
  M1 (and listed in `methodology.dropped`). **Identical payloads** are pinned to fixed
  args (a known recent block number, a known address) so providers answer the same
  question.
- **Warmup:** first 3 samples per method/provider are sent but flagged `is_warmup` and
  excluded from metrics (TLS/connection warmup).
- **Sequencing:** for each sample index, hit providers back-to-back with the same
  payload before advancing, so time-of-day drift hits both providers equally.
- **Measurement:** wall-clock round trip per request (monotonic clock). Timeout 8s.
  A request is a **failure** if non-200, JSON-RPC `error` present, or timed out.
- **Percentiles:** nearest-rank on the sorted non-warmup `latency_ms` array per
  provider (overall) and per method. `p95 = sorted[ceil(0.95 * n) - 1]`. `success_rate
  = ok / total`. `avg` over successful samples only; failures excluded from latency,
  counted in success rate.
- **Recorded for audit:** every observation row + the methodology JSON (request set,
  sample size, warmup, timeout, region, endpoint hostnames — never secrets, caveats).

### Caveats stamped on every M1 run
- Public/free endpoints, **not** standardized paid tiers → not a fair commercial
  comparison.
- Single region (Render's region) → not geographically representative.
- Small sample, no confidence intervals → directional, not publishable.

## Frontend rewire (exact points)

The UI stays; only the data source changes. Results components currently read the
`BASELINE` import directly — they'll take a `metrics` prop and fall back to `BASELINE`
when there's no run (the "See a sample report" path).

| File:line | Today | Change |
|-----------|-------|--------|
| `src/app/landing.jsx:557` | `onClick={() => setScreen("running")}` | `POST /api/runs` with the wizard's workload/providers; store `runId`; then `setScreen("running")`. |
| `src/app/results.jsx:15` (`Running`) | 24s `setInterval` + `Math.random()` seeded by `BASELINE` | Poll `GET /api/runs/:id` (~1s); drive progress + live counters from real partial data; on `done` → Results with `runId`. |
| `src/app/results.jsx:192` (`Results`) + children (`ResultsOverview*`, `LatencyCard`, `ReliabilityScores`, …) | read `BASELINE[id]` directly | accept `metrics` (shape of `BASELINE`); read from it; `metrics ?? BASELINE` so the sample report still works. |
| `src/app/results.jsx:622` (`History`) | hardcoded `runs` array | `GET /api/runs` on mount. |

Because the API returns the `BASELINE` shape, chart components (`Sparkline`,
`MultiLine`, `LiveRace`) need no changes. (Note: `src/app/data.jsx:233` still does an
`Object.assign(window, …)` left over from the global-scope era — safe to delete during
this work.)

## Deploy changes

`render.yaml` flips from a static site to a Node web service + a database:

```yaml
services:
  - type: web
    name: alchemy-benchmarks
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: node server/index.js     # serves dist/ + /api
    envVars:
      - key: DATABASE_URL
        fromDatabase: { name: alchemy-benchmarks-db, property: connectionString }
      - key: ALCHEMY_RPC_URL
        sync: false                          # set in dashboard (secret)
      - key: DRPC_RPC_URL
        value: https://eth.drpc.org
databases:
  - name: alchemy-benchmarks-db
    plan: free
```

Migrations run on boot (idempotent `create table if not exists`) for M1; a real
migration tool comes with M2+. **Caveat:** Render's free Postgres expires ~90 days
after creation, and free web services cold-start — fine for a slice, not production.

## Risks

- Public endpoint **rate limits** can throttle/scew results; keep sample size modest
  and surface 429s as failures.
- Single region and free tiers mean results are **directional only** — the UI must not
  imply otherwise (caveats are shown, not buried).
- In-process runner ties run lifetime to one instance; a deploy mid-run loses it. M1
  marks interrupted runs `error` on next boot.

## Build checklist

- [ ] `server/` Fastify app: static serving + `/api/runs` (POST/GET/:id), Postgres pool.
- [ ] Schema bootstrap on boot.
- [ ] Workload normalizer + method allowlist + fixed-param request builder.
- [ ] Provider adapters (Alchemy, dRPC) with timeout + error classification.
- [ ] In-process runner writing observations; metrics derivation.
- [ ] Frontend: 4 rewire points above; `metrics ?? BASELINE` fallback.
- [ ] `render.yaml` web service + Postgres; `.env.example`; README run instructions.
- [ ] Verify end to end locally against live endpoints before deploy.
