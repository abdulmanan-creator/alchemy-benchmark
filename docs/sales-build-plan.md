# Build plan — Sales-facing visual (FE-protected, additive)

Context: Sales wants a benchmarking **visual** they can show and potentially use. The
current frontend is therefore the product. This plan adds functionality *underneath*
and polishes the visual *additively*, without risking what already renders.

## Operating principles

1. **The curated sample is the face.** The polished `BASELINE` report
   (`src/app/data.jsx:32`) is the default prospects see. It has **zero backend
   dependency** — landing and "See a sample report" render even with no server.
2. **Real benchmarking is an additive internal mode.** Live runs go behind a flag /
   internal view, never the prospect-facing default. Public-endpoint results are
   directional and won't always favor Alchemy, so they stay off the demo path.
3. **Additive only.** New capability lives in new files (`server/`, new routes, a
   guarded "live" mode). Existing components keep reading `BASELINE` unless explicitly
   handed real data (`metrics ?? BASELINE`).
4. **Provable no-break.** Baselines live in `docs/baselines/`. Every FE change is
   diffed before/after with the browser tool; off-message or visual regressions block
   the change.
5. **Separate, revertable commits.** Backend/API lands and is verified by `curl`
   before any FE wiring; FE wiring and each enhancement are their own commits.

## Sequence

### Phase 1 — FE enhancements (additive, low risk, highest sales value)
All FE-only, all verified against `docs/baselines/`.

- **Credibility cues** — "methodology attached" badge, region / sample-size / timestamp
  labels on the results header. Makes the visual feel trustworthy. *Smallest, safest.*
- **Live-race hero polish** — sharpen the headline animation prospects see first
  (`LiveRace`, `src/app/data.jsx:168`). Visual-only.
- **Embeddable / shareable export** — let Sales drop the visual into decks/sites: a
  share-card PNG export and/or a self-contained embeddable view. Highest leverage for a
  sales asset. (Design note below.)

### Phase 2 — Real data, internal mode (the M1 backend)
Per [`milestone-1-real-benchmark.md`](milestone-1-real-benchmark.md), but gated:
- Built as an **internal "Live run" mode**, not the prospect default.
- Alchemy (free key) vs dRPC (public), one region, Postgres-persisted, raw observations
  separate from derived metrics.
- Results UI reads real `metrics` only inside live mode; the sample report is untouched.
- Every live run is stamped with its caveats (free endpoints / single region / small
  sample = directional).

## Embeddable export — design note

Two complementary outputs, both additive:
- **Share-card PNG** — render the existing `ShareCard` to an image for slides. Cheap;
  no backend.
- **Embeddable view** — a minimal route/build that renders just the results visual
  (the original demo was a self-contained HTML; the same bundling approach can produce
  a drop-in widget). Decide static-snapshot vs live when Phase 2 lands.

## Out of scope (unchanged from milestone doc)

Auth/orgs, HAR/CSV ingestion, multi-region workers, queue, quotas/billing — later
milestones. Nothing here touches the prospect-facing default.
