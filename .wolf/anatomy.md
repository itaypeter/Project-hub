commit	

# Anatomy

> One-line descriptions + token estimates. Read before opening any file.

## App files

| Path                                    | Description                                                                                                                                                     | ~tokens |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `app/index.html`                      | HTML shell;`lang="en" dir="ltr"` (was RTL — caused sidebar flip)                                                                                             | 50      |
| `app/src/main.jsx`                    | React root mount                                                                                                                                                | 30      |
| `app/src/App.jsx`                     | Root:`.shell` flex wrapper, Sidebar + main column, state for token/repos/storage/tabs                                                                         | 250     |
| `app/src/App.css`                     | All styles: shell/sidebar/tabs/cards/questions/output/status-bar                                                                                                | 400     |
| `app/src/index.css`                   | CSS custom properties (colors, fonts) + base reset                                                                                                              | 80      |
| `app/src/components/Sidebar.jsx`      | Left sidebar: storage toggle, GitHub/WebDAV fields, Claude key, project list                                                                                    | 150     |
| `app/src/components/TaskPanel.jsx`    | InputTab, QuestionsTab, TasksTab, OutputTab with card components                                                                                                | 300     |
| `app/src/components/CodeExplorer.jsx` | File tree + code viewer + Claude explanation panel                                                                                                              | 100     |
| `app/src/components/StatusBar.jsx`    | Bottom bar: Project//Hub left, pulse dot + timeAgo right                                                                                                        | 80      |
| `app/src/components/Toast.jsx`        | Transient notification overlay                                                                                                                                  | 40      |
| `app/src/components/Skeleton.jsx`     | Loading skeleton cards                                                                                                                                          | 40      |
| `app/src/hooks/useProjectLog.js`      | Fetch/push project-log.json, auto-refresh 45s, question/task state                                                                                              | 200     |
| `app/src/hooks/useRepoBrowser.js`     | GitHub tree fetch, file content, Claude explanation                                                                                                             | 150     |
| `app/src/hooks/useToast.js`           | Toast state helper                                                                                                                                              | 30      |
| `app/src/api/github.js`               | GitHub API: getLog, putLog, getTree, getFileContent, explainWithClaude, pushClaudeMd, getBrainWikiList, getBrainRawList, getBrainFile, pushRawNote, PROJ_COLORS | 350     |
| `app/src/api/webdav.js`               | WebDAV API: getLogWebDAV, putLogWebDAV                                                                                                                          | 80      |
| `app/src/hooks/useBrain.js`           | Brain state: wiki file list, raw count, file content, pushRaw, loadWiki, selectFile                                                                             | 120     |
| `app/src/components/BrainTab.jsx`     | Brain tab: raw note textarea + two-column wiki browser (mirrors CodeExplorer)                                                                                   | 150     |
| `GUIDE.md`                            | Full tutorial: setup, tabs, functions, schema, keyboard shortcuts                                                                                               | 400     |
| `TODO.md`                             | Prioritised to-do list: must/should/nice-to-have + known issues                                                                                                 | 200     |
| `CLAUDE.md`                           | Root agent instructions pushed by ⚙ Setup (scan → plan → implement → test → report), adopted from remote                                                       | 500     |
| `app/project-log.json`                | Task/question/output log — the Hub↔Claude contract; autopilot writes check-ins here                                                                             | 300     |

## Wolf files

| Path                  | Description                                         | ~tokens |
| --------------------- | --------------------------------------------------- | ------- |
| `.wolf/anatomy.md`  | This file                                           | 250     |
| `.wolf/cerebrum.md` | Preferences, learnings, do-not-repeat, decision log | 200     |
| `.wolf/memory.md`   | Session edit log                                    | 100     |
| `.wolf/buglog.json` | Known bugs and fixes                                | 100     |
