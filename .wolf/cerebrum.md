# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Last updated: 2026-06-28 (session 1)

## User Preferences

- Prefers direct action over questions when intent is clear
- Wants Claude to work autonomously and only ask when truly blocked
- Wants to see results in the dashboard, not manage the process
- Short confirmations ("yeah", "ok") = proceed with the plan
- Commits and pushes should happen when explicitly asked

## Key Learnings

- **Stack:** React 19 + Vite 8 + PWA (vite-plugin-pwa), plain CSS (no Tailwind), no TypeScript
- **Styling:** Single App.css file, CSS custom properties in index.css for design tokens
- **Storage backends:** GitHub API (default) and WebDAV/NAS (new) — toggled in sidebar
- **project-log.json:** Communication interface between user (dashboard) and Claude Code (agent). Lives in each tracked repo root. Fields: id, title, status, type, source, note, options, answer, commitUrl
- **CLAUDE.md:** Placed in each tracked repo to instruct Claude Code on autonomous operation + question schema
- **Hub Autopilot:** Cloud routine (trig_01Hyk3nY4NjgEadfHt43APXM) runs every 2 hours (cron `0 */2 * * *`), reads brain wiki + project-log.json, picks next task, implements it, pushes back
- **Deployed:** Railway at project-hub-production-101c.up.railway.app. Deploy via `railway up --service project-hub` from app/ dir. Static SPA served with `serve -s dist` (serve is a real dependency, NOT npx)
- **Brain (SimpleBrain):** git-based knowledge base. `/raw` (dumps) → Claude translates → `/wiki` (clean notes), `/archive` (processed), `/projects`. Brain repo set in sidebar, stored in localStorage `brain_repo`. When set, ⚙ Setup injects a brain-reading Step 0 into CLAUDE.md
- **Project overview:** getProjectOverview() in github.js reads README+package.json, asks Claude Haiku (claude-haiku-4-5) for 2-sentence summary. Shown on Input tab. Needs anthropicKey
- **App runs at:** localhost:5176 (ports 5173-5175 were in use during dev)
- **No TypeScript** — keep all new code as plain .jsx/.js
- **No comments** unless the WHY is non-obvious

## Key Learnings — Architecture

- `app/src/App.jsx` — main app, tab routing (input/questions/tasks/output/code), storage state
- `app/src/api/github.js` — GitHub API layer (getLog, putLog, getTree, getFileContent, explainWithClaude)
- `app/src/api/webdav.js` — WebDAV API layer (getLogWebDAV, putLogWebDAV)
- `app/src/hooks/useProjectLog.js` — task log state, auto-refresh 45s, questionTasks, answerQuestion
- `app/src/hooks/useRepoBrowser.js` — code explorer state
- `app/src/components/Sidebar.jsx` — storage toggle, token/WebDAV config, repo list
- `app/src/components/TaskPanel.jsx` — InputTab, QuestionsTab, TasksTab, OutputTab
- `app/src/components/CodeExplorer.jsx` — file tree + file viewer + AI explanation
- `app/project-log.json` — sample/template log file (Hebrew example tasks)

## Do-Not-Repeat

- [2026-06-28] index.html had `dir="rtl"` (Hebrew project) — caused flex sidebar to appear on RIGHT not LEFT. Fixed to `lang="en" dir="ltr"`. Never re-add RTL to index.html.
- [2026-06-28] Sidebar needs `.shell` flex wrapper in App.jsx — without it, sidebar falls out of flex layout. Shell = `display:flex; flex-direction:row; height:100vh`.
- [2026-06-28] Sidebar is `flex: 0 0 288px`, `border-right` (not border-left). Main is `flex: 1`.

- [2026-06-28] No TypeScript in this project — it's plain JSX/JS only
- [2026-06-28] No Tailwind — styling is all in App.css with CSS custom properties

- [2026-06-28] Never use `npx <pkg>` in a deploy start command — it downloads at startup and blows the Railway healthcheck window. Add the package as a real dependency.
- [2026-06-29] Never gate important action buttons behind `:hover { opacity }` — invisible at rest, terrible discoverability. Keep them always visible.
- [2026-06-29] Always wrap async data fetches (getTree, etc.) in try/catch and surface the error + a Retry button. No silent infinite skeletons.
- [2026-06-29] Empty states must not be gated behind `log && ...` — if log is null (no token / no file) the tab renders blank. Show a helpful empty state regardless.
- [2026-06-29] PWA is registerType:autoUpdate — after a deploy the user must fully close+reopen the tab (not just refresh) for the new service worker to activate. Mention this when telling them to verify.

## Decision Log

- [2026-06-28] Code linking: static regex parse of import/require statements → local files become clickable nav chips, external packages shown as grey badges. No LSP needed. Added `extractLinks()` in CodeExplorer.jsx.

- [2026-06-28] Storage: GitHub API (default) vs WebDAV — added toggle, WebDAV uses PUT/GET to NAS URL with Basic Auth
- [2026-06-28] Hub Autopilot: daily cloud routine instead of user-triggered sessions — reduces user time investment
- [2026-06-28] Questions tab: structured type:"question" tasks with options[] so user answers with one tap instead of typing
