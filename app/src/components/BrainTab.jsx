import { useState, useEffect } from "react";

function wikiLabel(filename) {
  return filename.replace(/\.md$/, "").replace(/-/g, " ");
}

export default function BrainTab({
  brainRepo,
  wikiFiles,
  rawCount,
  selectedFile,
  fileContent,
  loadingList,
  loadingFile,
  pushing,
  onLoadWiki,
  onSelectFile,
  onPushRaw,
  onShowToast,
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (brainRepo) onLoadWiki();
  }, [brainRepo]);

  const handlePush = async () => {
    if (!note.trim() || pushing) return;
    const ok = await onPushRaw(note.trim());
    if (ok) {
      setNote("");
      onShowToast?.("Note pushed to /raw — run Claude to translate", "success");
    } else {
      onShowToast?.("Failed to push note", "error");
    }
  };

  if (!brainRepo) {
    return (
      <div className="empty">
        <div className="empty-icon">🧠</div>
        <h2>No brain connected</h2>
        <p>Set a brain repo in the sidebar (owner/repo following SimpleBrain structure). Wiki entries will appear here.</p>
      </div>
    );
  }

  return (
    <div className="brain-layout">
      {/* Raw note input */}
      <div className="brain-raw-box">
        <div className="brain-raw-header">
          <span className="brain-raw-label">Drop a raw note</span>
          {rawCount > 0 && (
            <span className="brain-raw-badge">{rawCount} unprocessed in /raw</span>
          )}
        </div>
        <textarea
          className="brain-raw-textarea"
          placeholder="Anything — a thought, a decision, a customer insight, a link… Claude will translate it into /wiki."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePush();
          }}
        />
        <div className="brain-raw-actions">
          <span className="brain-raw-hint">⌘↵ to push</span>
          <button
            className="push-btn"
            onClick={handlePush}
            disabled={pushing || !note.trim()}
          >
            {pushing ? "Pushing..." : "Push to brain →"}
          </button>
        </div>
      </div>

      {/* Wiki browser */}
      <div className="brain-browser">
        {/* Wiki file list */}
        <div className="brain-wiki-list">
          <div className="tree-label">Wiki</div>
          {loadingList && (
            <div className="brain-list-loading">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-line" style={{ height: 10, marginBottom: 10, width: `${60 + (i % 3) * 15}%` }} />
              ))}
            </div>
          )}
          {!loadingList && wikiFiles.length === 0 && (
            <div className="brain-wiki-empty">
              <div style={{ color: "var(--muted)", fontSize: 12, fontFamily: "var(--mono)", lineHeight: 1.7 }}>
                No wiki entries yet.<br />
                Push a note and run Claude to translate /raw → /wiki.
              </div>
            </div>
          )}
          <div className="tree-items">
            {wikiFiles.map((f) => (
              <button
                key={f.path}
                className={`tree-item ${selectedFile?.path === f.path ? "selected" : ""}`}
                onClick={() => onSelectFile(f)}
              >
                <span className="tree-icon">📄</span>
                <span className="tree-name">{wikiLabel(f.name)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File content */}
        <div className="brain-wiki-content">
          {!selectedFile && !loadingList && (
            <div className="brain-content-empty">
              <span>Select a wiki entry to read it</span>
            </div>
          )}
          {selectedFile && (
            <div className="brain-entry">
              <div className="brain-entry-header">
                <span className="brain-entry-title">{wikiLabel(selectedFile.name)}</span>
                <a
                  className="brain-entry-link"
                  href={`https://github.com/${brainRepo}/blob/main/${selectedFile.path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ↗ GitHub
                </a>
              </div>
              {loadingFile ? (
                <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton-line" style={{ height: 11, width: `${50 + (i % 4) * 12}%` }} />
                  ))}
                </div>
              ) : (
                <pre className="brain-entry-body">{fileContent}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
