import { useState, useCallback } from "react";
import { searchBrainContent } from "../api/github.js";

const STATUS_LABELS = { idea: "idea", todo: "todo", done: "done", blocked: "blocked" };

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 120);
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 80);
  const pre = start > 0 ? "…" : "";
  const post = end < text.length ? "…" : "";
  return pre + text.slice(start, end) + post;
}

export default function SearchTab({ token, tasks, brainRepo, onGoToTask, onGoToBrain }) {
  const [query, setQuery] = useState("");
  const [brainResults, setBrainResults] = useState([]);
  const [brainLoading, setBrainLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const q = query.trim().toLowerCase();

  const taskResults = q
    ? (tasks || []).filter((t) =>
        t.title?.toLowerCase().includes(q) ||
        t.note?.toLowerCase().includes(q)
      )
    : [];

  const runBrainSearch = useCallback(async () => {
    if (!q || !brainRepo) return;
    setBrainLoading(true);
    setSearched(true);
    try {
      const results = await searchBrainContent(token, brainRepo, query.trim());
      setBrainResults(results);
    } finally {
      setBrainLoading(false);
    }
  }, [q, query, token, brainRepo]);

  const handleSearch = (e) => {
    e.preventDefault();
    runBrainSearch();
  };

  return (
    <div className="search-tab">
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Search projects and brain…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearched(false);
            setBrainResults([]);
          }}
          autoFocus
        />
        <button className="s-btn" type="submit" disabled={!q}>
          Search
        </button>
      </form>

      {q && (
        <div className="search-results">
          {/* Project tasks */}
          <div className="search-section">
            <div className="search-section-label">
              Project tasks
              <span className="search-count">{taskResults.length}</span>
            </div>
            {taskResults.length === 0 && (
              <div className="search-empty">No matching tasks</div>
            )}
            {taskResults.map((t) => (
              <button
                key={t.id}
                className="search-result-card"
                onClick={() => onGoToTask?.(t)}
              >
                <div className="search-result-header">
                  <span className={`task-status-dot ${t.status}`} style={{ marginTop: 2 }} />
                  <span className="search-result-title">{t.title}</span>
                  <span className={`search-status-chip status-${t.status}`}>
                    {STATUS_LABELS[t.status] || t.status}
                  </span>
                </div>
                {t.note && (
                  <div className="search-result-snippet">
                    {highlight(t.note, query.trim())}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Brain wiki */}
          {brainRepo && (
            <div className="search-section">
              <div className="search-section-label">
                Brain wiki
                {searched && !brainLoading && (
                  <span className="search-count">{brainResults.length}</span>
                )}
                {!searched && (
                  <button className="search-brain-btn" type="button" onClick={runBrainSearch}>
                    Search brain →
                  </button>
                )}
              </div>
              {brainLoading && (
                <div className="search-empty">Searching brain…</div>
              )}
              {!brainLoading && searched && brainResults.length === 0 && (
                <div className="search-empty">No wiki entries matched</div>
              )}
              {!brainLoading && brainResults.map((r) => (
                <button
                  key={r.path}
                  className="search-result-card"
                  onClick={() => onGoToBrain?.(r)}
                >
                  <div className="search-result-header">
                    <span className="tree-icon" style={{ marginTop: 1 }}>📄</span>
                    <span className="search-result-title">
                      {r.name.replace(/\.md$/, "").replace(/-/g, " ")}
                    </span>
                    <span className="search-status-chip status-brain">wiki</span>
                  </div>
                  {r.snippet && (
                    <div className="search-result-snippet">{r.snippet}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {!brainRepo && (
            <div className="search-section">
              <div className="search-section-label">Brain wiki</div>
              <div className="search-empty">Connect a brain repo in the sidebar to search wiki entries</div>
            </div>
          )}
        </div>
      )}

      {!q && (
        <div className="search-hint">
          <div className="empty-icon" style={{ fontSize: 32 }}>🔍</div>
          <p>Search across all project tasks and brain wiki entries</p>
        </div>
      )}
    </div>
  );
}
