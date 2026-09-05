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

### Entry 3- Tailwind Class Names — RESOLVED 03/09/2026 12:30 SAST

**What I Learnt:**
I learnt that Tailwind CSS needs to be able to detect class names in the source code when it builds the application. Dynamically creating class names, such as `bg-${color}-500`, can cause Tailwind to miss them during the production build. I also learnt that using complete class names directly in the code makes them easier for Tailwind to detect.

**Status:**
**Resolved — No action required.** The existing code was checked and no problematic dynamically constructed Tailwind class names were found.

**Demonstration:**
I checked the conditional Tailwind classes used in `App.jsx`, including classes such as `reflex-enter`, `animate-drive`, and `sm:col-span-2`. These classes are written as complete class names inside the template literals rather than being dynamically constructed. I also checked the Tailwind configuration and confirmed that it scans the `./src/**/*.{js,jsx}` files.

**How It Was Fixed:**
No changes were required because the existing implementation already uses Tailwind class names in a format that Tailwind can detect correctly. The classes are complete literal strings, so Tailwind's content scanner can identify and include them in the production build.

**What I Understand:**
I understand that Tailwind needs to detect the class names while scanning the project files. I understand that if a class is created dynamically, such as `bg-${color}-500`, Tailwind may not recognise it and the styling may not appear after the application is built. I also understand that using complete class names avoids this problem.

**What I Don't Understand:**
I do not fully understand how Tailwind's JIT compiler scans the source code and decides exactly which classes to include in the final production CSS. I also need to understand more about how dynamically generated class names can be handled when they are necessary in an application.

<<<<<<< HEAD
### Entry 4 — Pivot from a Prototype Demo to a Shared Delivery Coordination Platform — 16:10 SAST 03/09/2026

**Attempted:**

I reviewed the original Reflex prototype against the new Reflex Connect Africa prototype and realised that the project had moved beyond simply demonstrating an automated delivery board. The new direction focuses more strongly on connecting the three people involved in a delivery — the retailer, dispatcher and rider — through one coordinated workflow.

The original prototype was mainly concerned with proving that a delivery request could be created, assigned to a rider and completed. The new prototype puts more emphasis on the complete operational journey, including who is responsible for each stage, what happens when something goes wrong, and how information is communicated between the different roles.

**Main Observations:**

The product is now structured around three distinct roles:

Retailer — creates and monitors delivery requests.
Dispatcher — supervises deliveries and intervenes when automation cannot complete an assignment.
Rider — receives offers, accepts or declines jobs, confirms pickup and confirms delivery.

This made the prototype feel more like an actual coordination system rather than a simple delivery tracking interface.

**What I Learnt:**

I learnt that a good logistics solution should not only automate the main successful path. It must also explain what happens when a rider declines an order, does not respond, becomes unavailable, or when a delivery cannot be completed.

This led to the decision to keep the automated dispatch agent but give the dispatcher a clear human override.

**What I Don't Fully Understand:**

I still need to understand how these role permissions would be implemented securely in a production system where users have real accounts rather than selecting their role from the interface.

**Resolution / Next Step:**

The product direction was pivoted toward a role-based delivery coordination platform. The next stage is to strengthen the separation between demonstration roles and real authenticated users while keeping the workflow simple enough for small retailers and delivery teams.

### Entry 5 — Replacing Browser-Only State with Cloud-Based Shared Storage — 16:34 SAST 03/09/2026

Attempted:

I continued addressing the biggest limitation from the earlier prototype: different users and browsers could not reliably work from the same delivery board.

The original local-storage approach created an independent copy of the data in each browser. I therefore moved the shared storage layer to Supabase while keeping the existing window.storage interface used by the application.

Main Observations:

The repository now contains a Supabase client and a Supabase-backed storagePolyfill.js. Shared delivery information is written to the shared_app_state table instead of remaining only inside browser storage.

This was important because the application already had a good delivery workflow. Rewriting the entire application just to change the storage mechanism would have introduced unnecessary risk.

What I Learnt:

I learnt the difference between an application's user interface and its persistence layer. The same application functions can remain in place while the underlying storage mechanism changes.

I also learnt that making data "shared" is not the same as making the application fully real-time. A shared database allows different users to access the same source of data, but users still need a reliable way to receive changes made by other users.

What I Don't Fully Understand:

I still need to understand the best way to implement Supabase Realtime subscriptions and how to handle simultaneous updates without one user's changes overwriting another user's changes.

Resolution / Next Step:

Supabase has replaced browser-only storage for the shared delivery state. The next advancement is to move from periodic polling toward event-driven real-time synchronisation and stronger conflict handling.

### Entry 6 — Real-Time Synchronisation Between Users — 05/09/2026 20:03 SAST

Attempted:

I started working on the next limitation after moving the application data into Supabase: ensuring that changes made by one user are reflected for other users without requiring the application to repeatedly refresh the data.

The existing application can retrieve shared data, but retrieving shared data is different from receiving updates automatically.

Main Observations:

A central database solves the problem of where the data is stored, but it does not automatically mean that every open browser immediately updates its interface.

This means that a retailer, dispatcher and rider could potentially be looking at different versions of the delivery board for a short period.

What I Learnt:

I learnt the difference between shared persistence and real-time synchronisation.

The database provides a common source of truth, while a real-time subscription provides a mechanism for clients to react when that source of truth changes.

What I Don't Understand:

I am still working out exactly which database events should trigger interface updates and whether every change should be broadcast to every role.

Resolution / Next Step:

Investigate and implement Supabase Realtime subscriptions for the shared delivery state.

The goal is for changes to delivery status, rider assignment and other important state changes to appear across the relevant user interfaces without requiring a manual refresh.
### Entry 7 — Preventing Conflicting Delivery Updates — 05/09/2026 20:19 SAST

Attempted:

After moving toward shared real-time data, I identified another blocker: multiple users may attempt to change the same delivery at approximately the same time.

For example, a dispatcher may assign a rider while the automated dispatch process is also attempting to assign the same delivery.

Main Observations:

The problem is no longer simply whether data can be stored. The application must also determine which update should be accepted when multiple actions occur close together.

This becomes particularly important because the system has three different roles that can interact with the same delivery.

What I Learnt:

I learnt that shared applications need rules for concurrent updates.

It is not enough for the application to send updates to the database. The application must also protect important state transitions from being accidentally overwritten.

What I Don't Understand:

I am still learning how database transactions, conditional updates and conflict detection should be implemented for this type of workflow.

Resolution / Next Step:

Define clear delivery state transitions and ensure that important actions are validated before being committed.

The next implementation should prevent an already-assigned delivery from being silently reassigned by another process.

### Entry 8 — Automated Dispatch vs Human Override — 05/09/2026 20:24 SAST

Attempted:

I reviewed how the automated dispatch agent should interact with the dispatcher role.

The original prototype focused more heavily on automation, but the new product direction requires a human operator to intervene when the automated process cannot complete a delivery assignment.

Main Observations:

Automation is useful for the normal workflow, but real delivery operations include exceptions.

A rider may decline a delivery, fail to respond, become unavailable or be unsuitable for a particular delivery.

What I Learnt:

I learnt that the system should not treat automation as a replacement for the dispatcher.

Instead, automation should handle predictable decisions while the dispatcher acts as an escalation and override mechanism.

What I Don't Fully Understand:

I still need to determine exactly when control should move from the automated dispatch process to the dispatcher and how that handover should be represented in the delivery status.

Resolution / Next Step:

Define explicit escalation conditions.

When automation cannot successfully assign or progress a delivery, the system should clearly flag the delivery for dispatcher intervention rather than leaving it in an ambiguous state.
