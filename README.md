# Reflex — Last-Mile Delivery Prototype

A role-based (Retailer / Dispatcher / Rider) delivery-dispatch prototype with a
simulated auto-assignment ("dispatch agent") engine, pickup/delivery code
confirmation, and accessibility controls.

This was originally built as a **Claude Artifact** (a single self-contained
React component running inside Claude's sandbox, using Claude's built-in
`window.storage` API for persistence). This repo repackages it as a normal,
standalone Vite + React app so it can be run and deployed like any other
GitHub project.

See **BLOCKERS.md** for the specific things that had to change (and what you
should decide on) to make that work — please read it before treating this as
production-ready.

## Documentation

- [`docs/ERD.md`](docs/ERD.md) — entity-relationship diagram (Mermaid) of the
  data model implied by the current JSON shape.
- [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md) — order lifecycle, the
  dispatch agent's matching/retry logic, and the storage/data-flow layer.
- [`BLOCKERS.md`](BLOCKERS.md) — journal of porting issues and open decisions.

GitHub renders the Mermaid diagrams in both docs automatically — just open
them in the repo.

## Stack

- React 18 + Vite
- Tailwind CSS (utility classes used throughout the original component)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically http://localhost:5173).

To create a production build:

```bash
npm run build
npm run preview   # serve the build locally to sanity-check it
```

## Project structure

```
index.html                 Vite entry HTML
src/main.jsx                App bootstrap — installs the storage polyfill, then renders App
src/storagePolyfill.js      localStorage-backed stand-in for Claude's window.storage API
src/App.jsx                 The prototype itself (unmodified from the original artifact export)
src/index.css               Tailwind directives
tailwind.config.js
postcss.config.js
vite.config.js
BLOCKERS.md                 Journal of known issues / open decisions from the artifact→repo port
```

## Using the prototype

- Switch roles (Retailer / Dispatcher / Rider) from the header.
- As **Retailer**, submit a new delivery request.
- The background "dispatch agent" (a `setInterval` loop in `App.jsx`) will
  automatically offer it to the best free rider every few seconds.
- As **Rider**, pick the rider profile that has a pending offer to accept or
  decline it, then walk it through pickup → delivery using the scan/code modal.
- As **Dispatcher**, you can manually assign or reassign anything stuck.
- The "Reset demo" button in the header reseeds the sample data.

## Known limitation (read BLOCKERS.md)

Data is stored in the browser's `localStorage`, **not** shared across
tabs/devices/users. In the original artifact, all viewers saw one live,
shared board; here everyone gets their own independent copy. This is the
single biggest behavioral difference from the original — see BLOCKERS.md #1
for options to fix it.
