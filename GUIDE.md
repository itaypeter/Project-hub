# Project Hub — How It Works

A browser-based control panel for autonomous Claude Code agents. You push ideas; Claude scans the codebase, plans tasks, implements them, tests with Playwright, and reports back. No terminal required after setup.

---

## Setup

1. Open the live app at `https://project-hub-production-101c.up.railway.app`
2. In the sidebar, add your **GitHub token** (`ghp_...` with `repo` scope)
3. Add repos in `owner/repo` format (e.g. `itaypeter/ListoPosto`)
4. Optionally add your **Claude API key** (`sk-ant-...`) to enable Code Explorer AI explanations
5. Click **⚙ Setup** on each project to push `CLAUDE.md` — this gives Claude Code its autonomous instructions

---

## Tabs

### Input
Drop an idea or instruction for Claude. It gets written to `project-log.json` in the repo with `status: "idea"`. Claude picks it up on the next run.

**Functions:**
- `pushInput(title)` — writes a new `{ status: "idea", source: "user" }` task to the log
- `useProjectLog` hook polls every 45 seconds for updates

### Questions
When Claude is blocked and needs a decision before continuing, it writes a `type: "question"` task with 2–4 options. You tap one answer and Claude continues.

**Functions:**
- `answerQuestion(taskId, answer)` — marks the task `done` with an `answer` field; Claude reads it on next poll

### Tasks
Live view of all tasks Claude created and their status:
- `todo` (amber) — planned or in progress
- `blocked` (red) — waiting for user input
- `done` (green) — completed

**Functions:**
- `toggleTask(taskId)` — manually flip a task between `done` and `todo`

### Output
Structured reports Claude writes after finishing work:
```
✅ What was implemented
🔍 What to check in the UI
⚠️ Edge cases / concerns
```
Each card shows the commit hash linked to GitHub.

### Code
Browse any file in the repo. Click a file to view its content. If you have a Claude API key, it explains what the file does in 2–3 sentences. Also shows import connections — which files/packages this file depends on, with clickable navigation.

**Functions:**
- `getTree(token, repo)` — fetches the full recursive file tree
- `getFileContent(token, repo, path)` — fetches file content via GitHub Contents API
- `explainWithClaude(path, content, apiKey)` — calls Anthropic API for 2–3 sentence explanation
- `extractLinks(content, currentPath, tree)` — parses ES6 imports and require() calls, resolves relative paths

### Brain
Connected to your [SimpleBrain](https://github.com/BuildGreatProducts/SimpleBrain) repo — a git-based knowledge base where you capture raw notes and Claude translates them into clean wiki entries.

**Drop a raw note:**
Write anything (customer insight, business rule, decision made) and click **Push to brain →**. It lands in `/raw/[timestamp].md`.

**Browse the wiki:**
The left panel lists all files in `/wiki/`. Click one to read it. These are Claude-processed, clean knowledge entries.

**Functions:**
- `getBrainWikiList(token, repo)` — lists `.md` files in `/wiki`
- `getBrainRawList(token, repo)` — counts unprocessed files in `/raw`
- `getBrainFile(token, repo, path)` — fetches a wiki file's content
- `pushRawNote(token, repo, content)` — creates `/raw/[ISO-timestamp].md` with the note

---

## ⚙ Setup Button

Pushes a `CLAUDE.md` to any project repo. This file instructs Claude Code to work autonomously:

1. Scan the full codebase (`find`, `cat package.json`, `cat README.md`)
2. Read `project-log.json` for `idea` tasks
3. Plan — break idea into 3–6 atomic subtasks
4. Implement — commit after each change, update task statuses
5. Test with Playwright (install if needed, screenshot key UI states)
6. Report back with a structured output task (✅ done / 🔍 what to check / ⚠️ concerns)

If a **Brain repo is connected** in the sidebar, `CLAUDE.md` also includes a Step 0 that reads the brain wiki before any implementation — so Claude knows your terminology, customer types, pricing rules, etc.

**Function:**
- `pushClaudeMd(token, repo, brainRepo?)` — creates or updates `CLAUDE.md` via GitHub Contents API. Fetches existing SHA first so it can overwrite without a conflict.

---

## Hub Autopilot

A cloud routine that runs **every 2 hours** on `claude.ai/code` without you touching anything.

**What it does on each run:**
1. Reads the brain wiki (`itaypeter/brain`) for business context
2. Fetches `app/project-log.json` from the Project Hub repo
3. Picks the highest-priority pending task (`idea` → `todo`)
4. Marks it in progress, does the work, builds, commits, pushes
5. Marks the task done and writes an output report

**Trigger ID:** `trig_01Hyk3nY4NjgEadfHt43APXM`  
**Schedule:** `0 */2 * * *` (every 2 hours, all day)

---

## Storage Backends

**GitHub (default):** All reads/writes go through the GitHub Contents API. `project-log.json` lives in the root of each repo.

**WebDAV / NAS:** Point to a self-hosted WebDAV server. The log file is stored per-project at `/{project-name}/project-log.json`. Useful for private/offline setups.

---

## project-log.json Schema

```json
{
  "lastUpdated": "2026-06-29T10:00:00.000Z",
  "tasks": [
    {
      "id": 1234567890,
      "title": "Description",
      "status": "idea | todo | done | blocked",
      "type": "task | question | output",
      "source": "user | claude-code",
      "note": "Details",
      "commitUrl": "https://github.com/owner/repo/commit/abc123",
      "createdAt": "ISO 8601",
      "completedAt": "ISO 8601"
    }
  ]
}
```

| status    | meaning                                   |
|-----------|-------------------------------------------|
| `idea`    | User input — Claude picks it up and acts  |
| `todo`    | In progress                               |
| `done`    | Completed                                 |
| `blocked` | Needs user decision before Claude can continue |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1–6` | Switch tabs (Input / Questions / Tasks / Output / Code / Brain) |
| `r` | Refresh current tab |
| `n` | Focus the idea textarea (Input tab) |
| `⌘↵` | Push note (Brain tab textarea) |
| `Esc` | Close mobile sidebar |

---

## Tech Stack

- **React 19 + Vite 8** — no TypeScript, plain `.jsx`
- **vite-plugin-pwa** — installable as a PWA
- **Plain CSS** — design tokens in `index.css`, all styles in `App.css`
- **No backend** — 100% browser, GitHub API + Anthropic API direct from browser
- **Railway** — static SPA served with `serve -s dist`
