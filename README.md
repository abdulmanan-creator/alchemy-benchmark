# Alchemy Benchmarks

Marketing/product page for **Alchemy Benchmarks** — a tool that races your real RPC
traffic against Alchemy, Infura, Quicknode, dRPC, and Chainstack across four regions
and reports latency (p50/p95/p99), success rates, and per-method breakdowns.

This was extracted from a self-contained demo bundle into a real, editable
[Vite](https://vitejs.dev/) + React project so functionality can be built out.

> **Note:** the provider numbers in `src/app/data.jsx` (`BASELINE`) are currently
> synthetic placeholder data. Wiring up a real benchmarking backend is the next step.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs static site to dist/
npm run preview  # serve the production build locally
```

## Project layout

```
index.html            # mount point + module entry
src/styles.css        # Alchemy design system (tokens, fonts, components)
src/app/
  main.jsx            # App shell, screen routing, React mount
  data.jsx            # PROVIDERS / METHODS / REGIONS / BASELINE + shared components
  landing.jsx         # Landing page + run wizard
  results.jsx         # Running / Results / History screens
  tweaks.jsx          # (inert) in-editor tweak panel from the original demo
public/fonts/         # PP Neue Montreal (brand face)
public/assets/        # background + illustration images
```

## Deploy (Render)

`render.yaml` defines a static site. In the Render dashboard:
**New → Blueprint**, connect this repo, and Render builds `npm run build` and serves `dist/`.
