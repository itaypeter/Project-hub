const LOG_FILE = "project-log.json";

export async function ghFetch(token, path, opts = {}) {
  const res = await fetch(`https://api.github.com/${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getLog(token, repo) {
  try {
    const data = await ghFetch(token, `repos/${repo}/contents/${LOG_FILE}`);
    const content = atob(data.content.replace(/\n/g, ""));
    return { log: JSON.parse(content), sha: data.sha };
  } catch {
    return { log: { tasks: [], lastUpdated: null }, sha: null };
  }
}

export async function putLog(token, repo, log, sha) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(log, null, 2))));
  await ghFetch(token, `repos/${repo}/contents/${LOG_FILE}`, {
    method: "PUT",
    body: JSON.stringify({
      message: "chore: update project-log",
      content,
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function getTree(token, repo) {
  const repoData = await ghFetch(token, `repos/${repo}`);
  const branch = repoData.default_branch;
  const branchData = await ghFetch(token, `repos/${repo}/branches/${branch}`);
  const treeSha = branchData.commit.commit.tree.sha;
  const treeData = await ghFetch(
    token,
    `repos/${repo}/git/trees/${treeSha}?recursive=1`
  );
  return treeData.tree || [];
}

export async function getFileContent(token, repo, path) {
  const data = await ghFetch(
    token,
    `repos/${repo}/contents/${encodeURIComponent(path)}`
  );
  try {
    return atob(data.content.replace(/\n/g, ""));
  } catch {
    return "(binary file)";
  }
}

export async function getProjectOverview(token, repo, apiKey) {
  let readme = "";
  let pkg = "";
  try { readme = await getFileContent(token, repo, "README.md"); } catch {}
  try { pkg = await getFileContent(token, repo, "package.json"); } catch {}
  if (!readme && !pkg) return null;
  if (!apiKey) return null;
  const context = [
    pkg ? `package.json:\n${pkg.slice(0, 800)}` : "",
    readme ? `README:\n${readme.slice(0, 1200)}` : "",
  ].filter(Boolean).join("\n\n");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `In 2 sentences max: what does this project do and what's its tech stack?\n\n${context}`,
      }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.content?.[0]?.text || null;
}

export async function explainWithClaude(path, content, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Explain what this file does in a project in 2-3 sentences:\n\nFile: ${path}\n\n${content.slice(0, 2000)}`,
        },
      ],
    }),
  });
  if (!res.ok) return `API error: ${res.status}`;
  const data = await res.json();
  return data.content?.[0]?.text || "Could not get explanation.";
}

const CLAUDE_MD = `# Claude Code — Autonomous Agent

## Your role
You are a fully autonomous developer. The user communicates through \`project-log.json\`.
When you see ideas, execute them completely: scan the codebase → plan tasks → implement → test with Playwright → report back.
Make all decisions independently. Never ask unless completely blocked on something only the user knows.

---

## Step 1 — Scan the codebase first

Before writing any code, understand what you're working with:

\`\`\`bash
find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*' | head -80
cat package.json 2>/dev/null || cat pyproject.toml 2>/dev/null
cat README.md 2>/dev/null | head -60
\`\`\`

Read the main entry points. Understand the stack (framework, router, state, DB, test setup) and existing patterns before writing any new code. Match existing style — don't introduce new conventions.

---

## Step 2 — Read project-log.json

Find tasks with \`"status": "idea"\` — these are the user's inputs to act on.

---

## Step 3 — Plan

For each idea:
- Change its status → \`"todo"\` (marks it as picked up)
- Add 3–6 atomic subtask entries (\`"type": "task"\`, \`"status": "todo"\`) that break the idea into specific, verifiable steps
- Push project-log.json so the user can see the plan in Project Hub

---

## Step 4 — Implement

Work through each subtask:
- Follow existing patterns, naming, and architecture exactly
- Commit after each meaningful change: \`git add -A && git commit -m "feat: <what you did>"\`
- Update each task to \`"status": "done"\` with a short \`"note"\` on what changed
- If blocked: \`"status": "blocked"\` and ask a question (see schema below)

---

## Step 5 — Test with Playwright

After all changes:

\`\`\`bash
# Check if Playwright exists
ls playwright.config.* 2>/dev/null && npx playwright test || (
  npm install -D @playwright/test && npx playwright install chromium
)
\`\`\`

Write/run tests that cover the specific UI flows you changed. Take a screenshot of each key changed state:
\`\`\`js
await page.screenshot({ path: 'playwright-screenshots/after-change.png' });
\`\`\`

---

## Step 6 — Report back

Add one output task to project-log.json:

\`\`\`json
{
  "id": 1234567890,
  "type": "output",
  "status": "done",
  "source": "claude-code",
  "title": "One-line summary of what was done",
  "note": "✅ What was implemented\\n\\n🔍 What to check in the UI:\\n- Page X: verify Y\\n- Click Z: should do W\\n\\n⚠️ Edge cases / concerns\\n\\nFiles changed: src/...",
  "commitUrl": "https://github.com/owner/repo/commit/abc123",
  "createdAt": "ISO timestamp",
  "completedAt": "ISO timestamp"
}
\`\`\`

Push project-log.json — the user sees the report in Project Hub's Output tab.

---

## Schema

\`\`\`json
{
  "lastUpdated": "ISO 8601",
  "tasks": [
    {
      "id": 1234567890,
      "title": "Description",
      "status": "idea|todo|done|blocked",
      "type": "task|question|output",
      "source": "user|claude-code",
      "note": "Details",
      "commitUrl": "https://github.com/...",
      "createdAt": "ISO 8601",
      "completedAt": "ISO 8601"
    }
  ]
}
\`\`\`

| status | meaning |
|--------|---------|
| \`idea\` | User input — pick it up and execute |
| \`todo\` | Planned / in progress |
| \`done\` | Completed |
| \`blocked\` | Needs user input |

### Asking a question (only when truly blocked)
\`\`\`json
{
  "type": "question",
  "title": "Direct question?",
  "options": ["Option A", "Option B", "Decide for me"],
  "status": "idea",
  "source": "claude-code",
  "note": "Why you need this decision"
}
\`\`\`
Always include \`options\` with 2–4 choices. The user answers with one tap in Project Hub.
`;

export async function pushClaudeMd(token, repo, brainRepo = null) {
  const path = "CLAUDE.md";
  let sha;
  try {
    const existing = await ghFetch(token, `repos/${repo}/contents/${path}`);
    sha = existing.sha;
  } catch {
    sha = null;
  }
  const brainSection = brainRepo ? `
---

## Business context (SimpleBrain)

The business knowledge wiki lives at: https://github.com/${brainRepo}

Before implementing anything, read relevant wiki entries:
\`\`\`bash
gh api repos/${brainRepo}/contents/wiki --jq '.[].path'
# Then read each relevant file:
gh api repos/${brainRepo}/contents/wiki/<file>.md --jq '.content' | base64 -d
\`\`\`

Use this to understand terminology, existing decisions, customer types, pricing rules, and domain context before writing any code.
` : "";
  const finalMd = CLAUDE_MD + brainSection;
  const content = btoa(unescape(encodeURIComponent(finalMd)));
  await ghFetch(token, `repos/${repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message: "chore: add Claude Code autonomous agent instructions",
      content,
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function getBrainWikiList(token, repo) {
  try {
    const items = await ghFetch(token, `repos/${repo}/contents/wiki`);
    return items.filter((f) => f.type === "file" && f.name.endsWith(".md"));
  } catch {
    return [];
  }
}

export async function getBrainRawList(token, repo) {
  try {
    const items = await ghFetch(token, `repos/${repo}/contents/raw`);
    return items.filter((f) => f.type === "file");
  } catch {
    return [];
  }
}

export async function getBrainFile(token, repo, path) {
  const data = await ghFetch(token, `repos/${repo}/contents/${encodeURIComponent(path)}`);
  try {
    return atob(data.content.replace(/\n/g, ""));
  } catch {
    return "(binary)";
  }
}

export async function pushRawNote(token, repo, noteContent) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `raw/${ts}.md`;
  const content = btoa(unescape(encodeURIComponent(noteContent)));
  await ghFetch(token, `repos/${repo}/contents/${filename}`, {
    method: "PUT",
    body: JSON.stringify({
      message: "brain: add raw note",
      content,
    }),
  });
}

export const PROJ_COLORS = [
  "#7C3AED", "#10B981", "#F59E0B", "#EF4444",
  "#3B82F6", "#EC4899", "#14B8A6", "#F97316",
];

export function getFileIcon(name) {
  if (name.endsWith(".jsx") || name.endsWith(".tsx")) return "⚛";
  if (name.endsWith(".js") || name.endsWith(".ts")) return "📜";
  if (name.endsWith(".json")) return "{}";
  if (name.endsWith(".md")) return "📝";
  if (name.endsWith(".css") || name.endsWith(".scss")) return "🎨";
  if (name.endsWith(".py")) return "🐍";
  if (name.endsWith(".sh")) return "⚡";
  if (name.startsWith(".")) return "⚙";
  return "📄";
}
