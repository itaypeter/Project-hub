# Project Hub — To-Do List

## 📌 Session handoff — 2026-07-04

**Where we are:** Fully unblocked. Token rotated and verified end-to-end (autopilot ran clean with it), `itaypeter/brain` created and connected, infinite-fetch-loop bug found and fixed (deployed + committed), diverged git history reconciled.

**Remaining (user, in the app):**
1. Sidebar: remove **Ledgerdary** and re-add as `itaypeter/Ledgerdary` (currently saved with the `itaipeter` typo — the cause of its Setup 404), then click its ⚙ Setup.
2. Click ⚙ Setup on **ListoPosto** (Project-hub + SoulMatch already pushed).
3. Close ALL app tabs and reopen — the PWA service worker must swap in the fixed bundle; the 403s are GitHub's secondary rate limit from the old looping code and clear a few minutes after it stops.
4. Revoke old tokens at github.com/settings/tokens (dead `ghp_148...`; decide on the unused `github_pat_11...`).

**Remaining (dev):**
- Align project-log paths: the Hub UI reads `project-log.json` at repo **root**, the autopilot reads `app/project-log.json` for the Project-hub repo — inputs pushed from the UI are invisible to the autopilot until aligned (update trigger path or move the file).
- Decide on branch `autopilot-work` (54 autopilot commits: dark/light mode, token validation + user profile) — merge the good parts or discard.
- Delete placeholder `raw/README.md` in `itaypeter/brain` (shows as "1 unprocessed" in Brain tab).

⚠️ Token still sits in the trigger config in **plaintext** — rotating it means re-running the trigger update.

---

## Done 2026-07-02 ✅

- [x] Rotated GitHub token; swapped into all 4 spots of autopilot trigger `trig_01Hyk3nY4NjgEadfHt43APXM`
- [x] Created `itaypeter/brain` (private) with `raw/ wiki/ projects/ archive/`; connected in sidebar
- [x] **Fixed infinite fetch loop** — 68k GitHub requests in 40s, file clicks wiped (unstable hook deps in App.jsx); deployed to Railway, Playwright-verified (7 requests)
- [x] ⚙ Setup pushed CLAUDE.md (with brain) to Project-hub and SoulMatch
- [x] Autopilot confirmed running clean with the new token
- [x] Reconciled diverged remote (54 autopilot commits) — preserved as branch `autopilot-work`, main = deployed line

## Done 2026-06-29 ✅

- [x] Deployed SoulMatch to Vercel → soul-match-seven.vercel.app
- [x] Added all 4 projects to Project Hub (ListoPosto, Project-hub, Ledgerdary, SoulMatch)
- [x] Project overview card — auto-reads README + package.json, Claude Haiku 2-sentence summary
- [x] Setup + remove buttons now always visible (was hover-only)
- [x] Code tab error handling — shows error + Retry button instead of infinite skeleton
- [x] Tasks/Output tabs show empty states even before project-log.json exists
- [x] Toast duration extended 3s → 5s
- [x] External QA pass (Claude-on-Chrome) — 5 issues found, all 5 fixed
- [x] Logged all bugs to .wolf/buglog.json

## Done 2026-06-28 ✅

- [x] Full UI redesign implemented from design spec
- [x] RTL layout bug fixed (`<html dir="rtl">` → `ltr`)
- [x] Sidebar + tabs + status bar redesign
- [x] Code Explorer with import linking (clickable file connections)
- [x] ⚙ Setup button — pushes CLAUDE.md to any project repo in one click
- [x] CLAUDE.md template — autonomous scan → plan → implement → Playwright test → report cycle
- [x] Hub Autopilot — cloud routine, runs every 2 hours, picks up tasks and ships code
- [x] Railway deployment (static SPA via `serve -s dist`)
- [x] Brain tab — SimpleBrain integration with wiki browser + raw note input
- [x] Brain sidebar section — connect/disconnect brain repo
- [x] CLAUDE.md enriched with brain section when brain repo is configured
- [x] Hub Autopilot updated to read brain wiki before every run
- [x] GUIDE.md — full tutorial written

---

## Must do next 🔴

- [ ] **Fix Ledgerdary sidebar entry** — saved as `itaipeter/Ledgerdary` (typo, i instead of y): remove + re-add as `itaypeter/Ledgerdary`, then ⚙ Setup. (Mnemonic: email = ita**i**peter, GitHub = ita**y**peter.)

- [ ] **⚙ Setup on ListoPosto** — Project-hub and SoulMatch are done.

- [ ] **Reload the app cleanly** — close all tabs of the app so the service worker activates the fixed bundle; 403s (secondary rate limit from the old looping code) clear a few minutes after.

- [ ] **Revoke old GitHub tokens** — dead `ghp_148...`; decide on the unused `github_pat_11...`.

- [ ] **Align project-log.json path for the Project-hub repo** — UI reads repo root, autopilot reads `app/project-log.json`; ideas pushed from the Input tab are invisible to the autopilot until this is fixed.

---

## Should do soon 🟡

- [ ] **Brain: Translate button** — add a "Translate /raw → /wiki" button in the Brain tab that triggers a claude.ai cloud session to run the `prompts/translate.md` prompt against the brain repo. Currently the user has to run Claude Code manually.

- [ ] **Brain wiki markdown rendering** — currently shows raw `.md` text. Add basic rendering (bold, headings, links) without a heavy library — a simple regex transformer would do.

- [ ] **Brain repo in autopilot is hardcoded** — `itaypeter/brain` is hardcoded in the autopilot prompt. If the repo name changes, update the trigger via `RemoteTrigger update`. Consider storing it in `app/brain-config.json` in the Project Hub repo so the autopilot reads it dynamically.

- [ ] **Per-project brain config** — right now one brain repo serves all projects. Could store per-project brain overrides in project-log.json metadata.

- [ ] **Code Explorer on mobile** — file tree and code panel stack vertically but the layout needs tweaking for small screens.

- [ ] **Auto-deploy on push** — currently `railway up` must be run manually. Connect the Railway service to the GitHub repo so every push to `main` auto-deploys.

---

## Nice to have 🟢

- [ ] **Search across wiki** — search box in the Brain tab that filters wiki file names and content.

- [ ] **Push idea from menu** — right-click shortcut or browser extension to capture a raw note to the brain without opening the app.

- [ ] **Multi-agent support** — when an idea is big enough, split it into parallel sub-agents (one per file area), coordinate via project-log.json.

- [ ] **Project-level wiki** — the `projects/` folder in SimpleBrain is per-project. Surface project-specific notes in the relevant project's tabs.

- [ ] **Dark/light theme toggle** — currently hardcoded dark. Design tokens are already in CSS variables, just needs a `[data-theme="light"]` override block.

- [ ] **Notifications** — browser push notifications when Claude writes a question or completes a task (using the PWA service worker).

- [ ] **claude-squad integration** — [claude-squad](https://github.com/smtg-ai/claude-squad.git) runs multiple named Claude sessions in tmux. Could use it to spawn parallel agents for multi-task runs.

---

## Known issues 🐛

- Railway health check was failing with `npx serve` (package download delay). Fixed by adding `serve` as a proper `dependency` in package.json. Verify the latest deploy passed.
- Hub Autopilot token (`ghp_...`) is hardcoded in the trigger — it will break if the token expires. Rotate and update via `RemoteTrigger update`.
- Brain tab shows a `(binary)` message for non-UTF8 files. Rare in a markdown wiki, but worth a proper error state.
