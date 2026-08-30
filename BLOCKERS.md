# Blocker Journal — Reflex Prototype (Artifact → GitHub repo)

Running log of things that broke, had to be worked around, or are still open
decisions when converting `reflex_prototype.jsx` from a Claude Artifact into a
standalone repo. Newest-relevant items are marked **OPEN**; resolved porting
issues are marked **RESOLVED** with what was done.

---

### 1. Shared live board relies on Claude's `window.storage` — OPEN (design decision needed)

**Status:** Worked around for local dev, not fixed for real multi-user use.

The original artifact calls `window.storage.get/set(STORAGE_KEY, true)`. The
`shared: true` flag is what made every Retailer / Dispatcher / Rider viewer
look at the *same* live board — that's the whole point of the demo (see the
footer text: "anyone with this artifact link sees the same live board").

That backend doesn't exist outside Claude. I added `src/storagePolyfill.js`,
which implements the same method signatures (`get`, `set`, `delete`, `list`)
on top of `window.localStorage` so `App.jsx` didn't need to be touched at all.

**Consequence:** localStorage is scoped to one browser. Two people opening
this app — or even the same person in two different browsers — now get two
independent boards, not a shared one. The 2.5s polling loop in `App.jsx`
(`pollRef.current = setInterval(refresh, 2500)`) will just keep re-reading
your own local copy; it will never see another user's changes.

**To actually get shared/multi-user behavior you'd need a real backend.**
Options, roughly in order of effort:
- Supabase or Firebase Realtime Database/Firestore (fastest — mostly swapping
  `storagePolyfill.js`'s internals for SDK calls, same method shapes).
- A small Express/Fastify + SQLite or Postgres service you host yourself,
  called via `fetch`.
- A WebSocket relay if you want push updates instead of polling.

Until one of those is wired in, treat this as a **single-user local demo**.

---

### 2. `npm install` could not be verified in this environment — OPEN

**Status:** Config files are written and internally consistent, but
`npm install` / `npm run build` could not actually be executed here (this
sandbox has no outbound network access to the npm registry). `src/App.jsx`
was copied byte-for-byte from your uploaded file, so its JSX/JS is unchanged
from what you already had; the new files (`main.jsx`, `storagePolyfill.js`,
configs) are small and were reviewed by hand, but **please run `npm install
&& npm run dev` yourself as the first real smoke test** and report back
anything that fails.

---

### 3. Tailwind class names — RESOLVED (no action needed, noted for awareness)

Checked for dynamically-constructed class strings that Tailwind's JIT
compiler can miss during production builds (e.g. `` `bg-${color}-500` ``).
Found none — all conditional classes in `App.jsx` (`reflex-enter`,
`animate-drive`, `sm:col-span-2`, etc.) appear as complete literal strings
inside template literals, so Tailwind's content scanner (configured over
`./src/**/*.{js,jsx}` in `tailwind.config.js`) picks them up correctly. No
changes needed.

---

### 4. Browser-only APIs (`speechSynthesis`, `matchMedia`) — RESOLVED (already guarded)

The accessibility widget's read-aloud feature (`window.speechSynthesis`,
`SpeechSynthesisUtterance`) and the reduced-motion detection
(`window.matchMedia`) are both already feature-detected in the original code
(`typeof window !== "undefined"`, `try/catch` around `matchMedia`). These are
standard Web APIs available in any real browser (not Claude-specific), so no
polyfill was needed — they'll simply no-op gracefully in non-browser contexts
like SSR or headless test runners, and work normally in the browsers you'd
actually demo this in.

---

### 5. No real SMS/notification backend — OPEN (expected, flagging so it isn't mistaken for a bug)

`smsLog` entries shown in the Rider/Retailer views are simulated strings
appended to app state — no Twilio (or similar) integration exists, and none
was implied by the original artifact. If a stakeholder expects real texts to
go out, that's new scope, not a porting bug.

---

### 6. Multi-tab sync within a single browser — OPEN (minor, only matters if you fix #1 partially)

Even if you leave storage as plain `localStorage`, note that the `storage`
event (which lets other tabs on the same browser hear about changes) is not
wired up in `storagePolyfill.js` — same-tab code only reacts to its own
`setInterval` polling. If you want same-browser multi-tab sync as a cheap
partial fix short of a real backend, add a `window.addEventListener("storage", ...)`
listener that re-runs `refresh()` in `App.jsx`.

---

## Suggested next steps, in order

1. Run `npm install && npm run dev` locally, confirm it boots (item 2).
2. Decide whether this ships as single-user-only (fine as-is) or needs the
   shared board restored (item 1) — that decision drives everything else.
3. If shipping to GitHub Pages/Netlify/Vercel as a static demo, single-user
   localStorage is probably fine and cheapest — just be upfront with viewers
   that each browser gets its own sandboxed data, unlike the original demo
   link.
