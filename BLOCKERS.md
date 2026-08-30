Blocker Journal — Reflex Prototype (Artifact → GitHub repo)

Entry 1 — Shared Storage Dependency — 30/08/2026 17:55 SAST
Attempted: I tried to run the app locally after replacing Claude's window.storage system with a local storage solution. I created src/storagePolyfill.js to replace the original storage functions while keeping the same functions for getting, saving, deleting, and listing data. This meant that App.jsx did not need to be changed.
Main Observations: two people opening the app, or the same person in two different browsers, get two independent boards instead of one shared one
what i understand: the original artifact's shared board depended on a real backend behind window.storage that doesn't exist outside Claude's sandbox; the polyfill fixes the API shape but not the multi-user behaviour
What i dont understand: why eplacement storage solution makes the app run, but it cannot make the information shared between different users or browsers.
Resolution / next step: decide whether to add a real backend (Supabase/Firebase, a small self-hosted API, or a WebSocket relay) to restore shared multi-user behaviour, or ship as a single-user local demo
