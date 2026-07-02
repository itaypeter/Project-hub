# Project Hub — To-Do List

## 📌 Session handoff — 2026-07-02

**Where we are:** App is built and deployed. Railway is **Online & healthy**. **Token blocker resolved:** new `ghp_Oax...` token (scopes: repo, workflow, project) generated and verified against the GitHub API; autopilot trigger `trig_01Hyk3nY4NjgEadfHt43APXM` updated — token swapped in all 4 spots, next run 2026-07-02 18:06 UTC.

**Remaining (do in order):**
1. You: paste the new token into Hub sidebar (GitHub token → change).
2. You: revoke old tokens at github.com/settings/tokens (dead `ghp_148...` + check the unused `github_pat_11...`).
3. Fix brain repo value (currently wrong: `itaypeter/SoulMatch`) → create `itaypeter/brain` (`raw/ wiki/ projects/ archive/`) → re-click ⚙ Setup on each project.
4. Verify autopilot run after 18:06 UTC actually succeeded.

⚠️ Token still sits in the trigger config in **plaintext** — rotating it means re-running the trigger update.

---

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

- [ ] **Refresh the GitHub token** — the token in Project Hub is returning 401 (expired/revoked). Generate a new `ghp_...` with `repo` scope at github.com/settings/tokens, then sidebar → GitHub token → change. Everything GitHub-dependent is blocked until this is done.

- [ ] **Fix the Brain repo value** — it's currently set to `itaypeter/SoulMatch` (wrong). Remove it (× in Brain section) and set the real brain repo.

- [ ] **Create the brain repo** — fork [BuildGreatProducts/SimpleBrain](https://github.com/BuildGreatProducts/SimpleBrain) or create `itaypeter/brain` manually with the folder structure (`raw/`, `wiki/`, `projects/`, `archive/`). The Brain tab and autopilot expect this repo to exist. Note: autopilot prompt has `itaypeter/brain` hardcoded — match that name or update the trigger.

- [ ] **Click ⚙ Setup on each project** after the token is refreshed and brain repo is set — re-pushes CLAUDE.md with the brain wiki step included.

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
