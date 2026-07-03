# Memory

> Chronological action log. Updated after every significant action.

## Session: 2026-06-28 (initial)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| session | Read full project codebase | all src files | Understood architecture: React+Vite PWA, GitHub API, project-log.json protocol | ~8000 |
| session | Added Questions tab with option buttons | TaskPanel.jsx, App.jsx, useProjectLog.js, App.css | Users can answer Claude's questions with one tap | ~3000 |
| session | Added auto-refresh (45s) + toast on new questions | useProjectLog.js, App.jsx | Dashboard updates live without manual refresh | ~1000 |
| session | Added WebDAV/NAS storage backend | webdav.js (new), useProjectLog.js, Sidebar.jsx, App.jsx, App.css | GitHub/NAS toggle in sidebar | ~4000 |
| session | Rewrote CLAUDE.md with autonomous operation guide | CLAUDE.md | Claude now knows to ask questions via type:"question" schema | ~1000 |
| session | Created Hub Autopilot cloud routine | RemoteTrigger API | Routine ID: trig_01Hyk3nY4NjgEadfHt43APXM, runs daily 8am Zurich | ~500 |
| session | Committed + pushed all changes | all modified files | commit 78ed119 on main | ~200 |
| session | Installed OpenWolf into this project | .wolf/ folder | Protocol active for future sessions | ~500 |

## Session: 2026-06-28 (design implementation)

| Time | Action | File(s) |
|------|--------|---------|
| session | Imported design from claude.ai/design (db6c78c0) | — |
| session | Added .shell flex wrapper; split topbar into desk-header + mobile topbar + tabs-strip | App.jsx |
| session | Rewrote App.css: underline tabs, left-border outputs, vertical question options, pulse dot status bar | App.css |
| session | Updated Sidebar: glow dots, proj-badge, sidebar-scroll container | Sidebar.jsx |
| session | Rewrote TaskPanel: vertical option buttons with radio circles, output left-border with commit hash | TaskPanel.jsx |
| session | Rewrote CodeExplorer: tree-label, button items, claude-explains panel | CodeExplorer.jsx |
| session | Rewrote StatusBar: Project//Hub left, timeAgo + pulse dot right | StatusBar.jsx |
| session | Fixed dir="rtl" → dir="ltr" in index.html (sidebar was flipped to right) | index.html |
| session | Created anatomy.md | .wolf/anatomy.md |

## Session: 2026-06-28 (code linking)

| Time | Action | File(s) |
|------|--------|---------|
| session | Added import parser + connections panel to Code Explorer: local file chips (clickable nav) + external package badges | CodeExplorer.jsx, App.css, App.jsx |

## Session: 2026-06-28/29 (brain + deploy + setup button)

| Time | Action | File(s) |
|------|--------|---------|
| session | Added ⚙ Setup button to each project row — pushes CLAUDE.md with autonomous workflow + brain section | Sidebar.jsx, github.js |
| session | CLAUDE.md template includes brain wiki reading when brainRepo is set | github.js |
| session | Added serve as proper dependency (was npx → Railway health check was failing) | package.json |
| session | Hub Autopilot updated to run every 2 hours | RemoteTrigger |
| session | Built SimpleBrain integration: Brain tab (wiki browser + raw note push) + brain sidebar section | BrainTab.jsx (new), useBrain.js (new), Sidebar.jsx, App.jsx, App.css |
| session | Added github.js brain API: getBrainWikiList, getBrainRawList, getBrainFile, pushRawNote | github.js |
| session | Hub Autopilot updated: Step 0 reads brain wiki before picking up tasks | RemoteTrigger |
| session | Deployed to Railway: project-hub-production-101c.up.railway.app | railway |
| session | Wrote GUIDE.md (full tutorial) and TODO.md (to-do list) | GUIDE.md, TODO.md |

## Session: 2026-06-29 (SoulMatch deploy + QA fixes)

| Time | Action | File(s) |
|------|--------|---------|
| session | Deployed SoulMatch to Vercel (soul-match-seven.vercel.app), guided user through CLI prompts | (external) |
| session | Added project overview: getProjectOverview() reads README+package.json, Claude Haiku 2-sentence summary | github.js, App.jsx, TaskPanel.jsx, App.css |
| session | Setup/remove buttons always visible (removed opacity:0 hover-gating) | App.css |
| session | Code tab error handling: treeError state + Retry button (was infinite skeleton on bad token) | useRepoBrowser.js, CodeExplorer.jsx, App.jsx |
| session | Tasks/Output tabs show empty states even when log is null | TaskPanel.jsx |
| session | Overview card always renders (shows 'add API key' prompt when no key) | TaskPanel.jsx |
| session | Toast duration 3s → 5s | useToast.js |
| session | Logged 5 bugs to buglog.json | .wolf/buglog.json |
| session | Ran external QA pass (Claude-on-Chrome) — found 5 issues, all fixed | (external) |

## Session: 2026-06-30 (status review + handoff)

| Time | Action | File(s) |
|------|--------|---------|
| session | Verified Railway deploy: Online, latest build SUCCESS (59a6a16a), serve-dependency fix held | (railway CLI) |
| session | Audited autopilot trigger: enabled, cron 0 */2 * * *, sonnet-4-6. Found dead ghp_148 token hardcoded in 4 prompt spots → every run silently failing. Token in plaintext. | (RemoteTrigger get) |
| session | Wrote dated handoff atop TODO.md; logged dead-token/autopilot bug to buglog.json | TODO.md, .wolf/buglog.json |
- 2026-07-02: Rotated GitHub token — new ghp_Oax... verified (repo,workflow,project scopes), swapped into all 4 spots of Hub Autopilot trigger trig_01Hyk3nY4NjgEadfHt43APXM via RemoteTrigger update; TODO.md handoff updated. Remaining: paste token in sidebar, revoke old tokens, brain repo fixes.
- 2026-07-02: Playwright-verified deployed app with new token — all tabs work, brain repo connects. FINDING: UI reads project-log.json at repo ROOT but Hub Autopilot trigger reads app/project-log.json — path mismatch for the Project-hub repo; inputs pushed from UI won't be seen by autopilot until aligned.
- 2026-07-02: Fixed infinite fetch loop in app/src/App.jsx (useMemo storage + stable callback deps); rebuilt and deployed to Railway (deploy 0c932b2f SUCCESS, bundle index-osYdWAc-). Playwright-verified live: 7 requests instead of 68k, file click + Setup work. Setup 404 in user's browser = wrong token saved (github_pat instead of ghp_).
- 2026-07-02: Committed loop fix (851d6cb); found remote main diverged w/ 54 autopilot commits (dark mode, gh_user validation) — preserved as branch 'autopilot-work', adopted root CLAUDE.md + app/project-log.json, force-pushed main (344de2c). Autopilot confirmed running OK with new token (check-in commit 97136f4). User's Setup 404 root cause: Ledgerdary saved as 'itaipeter/Ledgerdary' in their browser (token was correct).
- 2026-07-03: Autopilot picked up idea task 1783027962289 (brain/Obsidian concept). Built: (1) Search tab — unified search across project tasks + brain wiki via GitHub Code Search API; (2) BrainTab category field — prepends #tag to raw notes for auto-organization. Commit 77ac5a3. Build clean (237KB JS bundle). Log updated with all subtasks done + output card.
