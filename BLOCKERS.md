Blocker Journal — Reflex Prototype (Artifact → GitHub repo)

### Entry 1 — Shared Storage Dependency — 30/08/2026 17:55 SAST 
Attempted: I tried to run the app locally after replacing Claude's window.storage system with a local storage solution. I created src/storagePolyfill.js to replace the original storage functions while keeping the same functions for getting, saving, deleting, and listing data. This meant that App.jsx did not need to be changed. 
Main Observations: two people opening the app, or the same person in two different browsers, get two independent boards instead of one shared one 
what i understand: the original artifact's shared board depended on a real backend behind window.storage that doesn't exist outside Claude's sandbox; the polyfill fixes the API shape but not the multi-user behaviour What i dont understand: why eplacement storage solution makes the app run, but it cannot make the information shared between different users or browsers. 
Resolution / next step: decide whether to add a real backend (Supabase/Firebase, a small self-hosted API, or a WebSocket relay) to restore shared multi-user behaviour, or ship as a single-user local demo

### Entry 2 — Replacing Local Storage with Supabase for Shared Data — 08/30/2026 22:43 SAST

**Attempted:**
I replaced the browser-based `localStorage` storage solution with Supabase so that the delivery board could be stored in one shared database instead of separately in each user's browser. I created a Supabase project, created a `shared_app_state` table to store the shared delivery information as JSON, enabled Row Level Security (RLS), and created policies that allow the application to read, insert and update the shared data. I also installed the Supabase package in the GitHub Codespace and created a `supabaseClient.js` file to connect the React application to Supabase. The `storagePolyfill.js` file was then changed so that shared data is sent to Supabase instead of `localStorage`.

**Result:**
The application can now use Supabase as the storage location for the shared delivery board. The existing `App.jsx` storage calls were kept the same, so the main application structure did not need to be rewritten. The `shared` flag is now used to send the shared delivery data to the Supabase database instead of saving it only in the user's browser.

**Main Observations:**
The original problem was caused by `localStorage` being limited to one browser. Supabase provides one central database that can be accessed by different users and browsers. This means the data is no longer limited to the browser where it was created. The next test is to confirm that a delivery created in one browser is saved in the `shared_app_state` table and can be retrieved from another browser.

**What I understand:**
I understand that `localStorage` creates a separate copy of the delivery board for each browser, which is why different users could not see the same information. I now understand that Supabase acts as the shared database between the users. I also understand that `supabaseClient.js` connects the application to Supabase, while `storagePolyfill.js` controls how the application saves and retrieves the shared delivery data. The existing `App.jsx` can continue using `window.storage.get()` and `window.storage.set()` because the storage layer underneath them has been changed from `localStorage` to Supabase.

**What I don't understand:**
I understand how the shared data is now stored in Supabase, but I still need to confirm how Supabase Realtime will automatically notify the other users when the delivery board changes. I also need to understand how the dispatch agent should be handled so that multiple browsers do not try to assign the same delivery at the same time.

**Resolution / Next Step:**
The localStorage limitation was addressed by connecting the shared storage API to Supabase. The next step is to test that the delivery data is successfully saved to the `shared_app_state` table and can be accessed from another browser. After confirming that the shared database works, Supabase Realtime will be added so that changes to the delivery board can be reflected across users without relying only on the existing 2.5-second polling.
