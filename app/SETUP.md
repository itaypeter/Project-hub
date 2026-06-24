# Project//Hub — Setup Guide

## What is this?

A personal project management dashboard that lives in Claude.ai.
It connects directly to your GitHub repos so you and Claude Code stay in sync — no external tools, no third-party apps.

**The idea in one sentence:** Claude Code writes to a `project-log.json` file in each repo, and the dashboard reads it in real time via the GitHub API.

---

## How it works

```
You (dashboard)  ──→  writes ideas  ──→  project-log.json (GitHub)
                                               ↕
Claude Code      ──→  reads ideas   ──→  executes them
                ←──   writes back   ←──  marks done/todo/blocked
```

The dashboard has two panels:

- **Tasks panel** — see all todo / done / blocked / idea tasks per repo, and push new ideas directly to GitHub
- **Code explorer** — browse every file in the repo; click any file to get an AI explanation of what it does

---

## Setup — 3 steps

### Step 1 — Add the log file to each repo

Copy `project-log.json` into the root of every repo you want to track:

```json
{
  "lastUpdated": null,
  "tasks": []
}
```

Then commit and push:

```bash
cp project-log.json /path/to/your-repo/
cd /path/to/your-repo
git add project-log.json
git commit -m "chore: add project-log"
git push
```

---

### Step 2 — Add the Claude Code instructions

Copy `CLAUDE.md` into the root of each repo. Claude Code reads this file automatically at the start of every session — so it will know how to update the log without you having to ask.

```bash
cp CLAUDE.md /path/to/your-repo/
git add CLAUDE.md
git commit -m "chore: add Claude Code instructions"
git push
```

---

### Step 3 — Open the dashboard

1. Open `project-dashboard.jsx` as an Artifact in Claude.ai
2. In the sidebar, enter your **GitHub Personal Access Token**
   - Go to: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Required permissions: **Contents** (read & write) on each repo you want to track
3. Add repos in the format `owner/repo-name` (e.g. `john/my-app`)
4. Click a repo to see its tasks and browse its code

---

## How Claude Code should update the log

Claude Code picks this up automatically from `CLAUDE.md`, but here's the full reference:

### Add a new task
```bash
python3 -c "
import json, time
with open('project-log.json') as f:
    log = json.load(f)
log['tasks'].append({
    'id': int(time.time() * 1000),
    'title': 'Describe the task here',
    'status': 'todo',
    'createdAt': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime()),
    'source': 'claude-code'
})
log['lastUpdated'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
with open('project-log.json', 'w') as f:
    json.dump(log, f, ensure_ascii=False, indent=2)
"
```

### Mark a task as done
```bash
python3 -c "
import json, time
TASK_ID = 1234567890  # replace with actual id
with open('project-log.json') as f:
    log = json.load(f)
for t in log['tasks']:
    if t['id'] == TASK_ID:
        t['status'] = 'done'
        t['completedAt'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
log['lastUpdated'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
with open('project-log.json', 'w') as f:
    json.dump(log, f, ensure_ascii=False, indent=2)
"
```

### Check for user ideas (and act on them)
```bash
python3 -c "
import json
with open('project-log.json') as f:
    log = json.load(f)
for t in log['tasks']:
    if t['status'] == 'idea':
        print(t['id'], '|', t['title'])
"
```
When you start working on an idea, change its status to `todo`. When done, change to `done`.

### Always push after updating
```bash
git add project-log.json && git commit -m "chore: update project-log" && git push
```

---

## Task statuses

| Status    | Meaning                              |
|-----------|--------------------------------------|
| `todo`    | Pending — needs to be done           |
| `done`    | Completed                            |
| `blocked` | Stuck — needs your attention         |
| `idea`    | Added by you in the dashboard — read and execute! |

---

## Files included

| File | Purpose |
|------|---------|
| `project-dashboard.jsx` | The dashboard app — open in Claude.ai |
| `project-log.json` | Copy to each repo root |
| `CLAUDE.md` | Copy to each repo root — Claude Code reads this automatically |
