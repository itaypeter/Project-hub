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

export async function getUser(token) {
  return ghFetch(token, "user");
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

export async function explainWithClaude(path, content, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
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
