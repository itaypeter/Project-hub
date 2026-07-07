import { useEffect } from "react";

function parseSection(heading, body) {
  return { heading, body: body.trim() };
}

function GuideRenderer({ content }) {
  const lines = content.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(parseSection(current.heading, current.lines.join("\n")));
      current = { heading: line.slice(3), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(parseSection(current.heading, current.lines.join("\n")));

  if (sections.length === 0) {
    return <pre className="guide-raw">{content}</pre>;
  }

  return (
    <div className="guide-sections">
      {sections.map((s, i) => (
        <div key={i} className="guide-section">
          <div className="guide-section-heading">{s.heading}</div>
          <pre className="guide-section-body">{s.body}</pre>
        </div>
      ))}
    </div>
  );
}

export default function GuideTab({
  activeRepo,
  anthropicKey,
  guide,
  loading,
  generating,
  error,
  onLoad,
  onRegenerate,
}) {
  useEffect(() => {
    if (activeRepo) onLoad();
  }, [activeRepo]);

  if (!activeRepo) {
    return (
      <div className="empty">
        <div className="empty-icon">📖</div>
        <h2>No project selected</h2>
        <p>Select a GitHub repo to view or generate its codebase guide.</p>
      </div>
    );
  }

  if (!anthropicKey) {
    return (
      <div className="empty">
        <div className="empty-icon">🔑</div>
        <h2>Anthropic key required</h2>
        <p>Set your Anthropic API key in the sidebar to generate codebase guides.</p>
      </div>
    );
  }

  return (
    <div className="guide-tab">
      <div className="guide-header">
        <div className="guide-header-left">
          <span className="guide-title">Codebase Guide</span>
          {guide && !generating && (
            <span className="guide-cache-hint">cached · CODEBASE.md</span>
          )}
        </div>
        <button
          className="push-btn"
          onClick={onRegenerate}
          disabled={generating || loading}
        >
          {generating ? "Generating…" : guide ? "↻ Regenerate" : "Generate Guide"}
        </button>
      </div>

      {error && <div className="guide-error">{error}</div>}

      {loading && (
        <div className="guide-skeleton">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton-line"
              style={{ height: 13, marginBottom: 16, width: `${38 + (i % 5) * 11}%` }}
            />
          ))}
        </div>
      )}

      {generating && (
        <div className="guide-generating">
          <div className="guide-gen-dots">
            <span /><span /><span />
          </div>
          <span className="guide-gen-label">Claude is reading your codebase…</span>
        </div>
      )}

      {!loading && !generating && !guide && (
        <div className="empty" style={{ minHeight: 200 }}>
          <div className="empty-icon">📖</div>
          <p>
            No guide yet. Click <strong>Generate Guide</strong> to have Claude analyze
            this repo and save a CODEBASE.md.
          </p>
        </div>
      )}

      {!loading && !generating && guide && (
        <div className="guide-content">
          <GuideRenderer content={guide} />
        </div>
      )}
    </div>
  );
}
