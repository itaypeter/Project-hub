import { useMemo } from "react";
import { SkeletonTree } from "./Skeleton.jsx";

function resolvePath(dir, rel) {
  const parts = [...(dir ? dir.split("/") : []), ...rel.split("/")];
  const out = [];
  for (const p of parts) {
    if (p === "..") out.pop();
    else if (p !== ".") out.push(p);
  }
  return out.join("/");
}

function extractLinks(content, currentPath, tree) {
  if (!content || !currentPath) return [];
  const filePaths = new Set(tree.filter((i) => i.type === "blob").map((i) => i.path));
  const dir = currentPath.split("/").slice(0, -1).join("/");
  const seen = new Set();
  const links = [];

  const importRe = /(?:import|export)\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
  const requireRe = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  function add(raw) {
    if (seen.has(raw)) return;
    seen.add(raw);
    if (raw.startsWith(".")) {
      const base = resolvePath(dir, raw);
      const exts = ["", ".js", ".jsx", ".ts", ".tsx", ".json", ".css", "/index.js", "/index.jsx", "/index.ts", "/index.tsx"];
      for (const ext of exts) {
        if (filePaths.has(base + ext)) {
          links.push({ raw, resolved: base + ext, kind: "local" });
          return;
        }
      }
      links.push({ raw, resolved: null, kind: "local" });
    } else {
      const pkg = raw.startsWith("@") ? raw.split("/").slice(0, 2).join("/") : raw.split("/")[0];
      if (!seen.has("pkg:" + pkg)) {
        seen.add("pkg:" + pkg);
        links.push({ raw: pkg, resolved: null, kind: "pkg" });
      }
    }
  }

  let m;
  while ((m = importRe.exec(content)) !== null) add(m[1]);
  while ((m = requireRe.exec(content)) !== null) add(m[1]);
  return links;
}

export default function CodeExplorer({
  displayTree,
  tree = [],
  treeError,
  loading,
  selectedPath,
  fileContent,
  explanation,
  explaining,
  onSelectFile,
  onRetry,
}) {
  const links = useMemo(
    () => extractLinks(fileContent, selectedPath, tree),
    [fileContent, selectedPath, tree]
  );

  const localLinks = links.filter((l) => l.kind === "local");
  const pkgLinks = links.filter((l) => l.kind === "pkg");

  return (
    <div className="explorer">
      <div className="file-tree">
        <div className="tree-label">Files</div>
        {treeError && (
          <div style={{ padding: "10px 0" }}>
            <div style={{ color: "var(--red)", fontFamily: "var(--mono)", fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
              {treeError}
            </div>
            <button className="s-btn" style={{ width: "100%", fontSize: 11 }} onClick={onRetry}>
              Retry
            </button>
          </div>
        )}
        <div className="tree-items">
          {!treeError && displayTree.length === 0 && loading && <SkeletonTree count={8} />}
          {displayTree.map((item) => {
            const parts = item.path.split("/");
            const depth = parts.length - 1;
            const name = parts[parts.length - 1];
            const isDir = item.type === "tree";
            return (
              <button
                key={item.path}
                className={`tree-item ${selectedPath === item.path ? "selected" : ""}`}
                onClick={() => !isDir && onSelectFile(item.path)}
              >
                {Array.from({ length: depth }).map((_, i) => (
                  <span key={i} className="tree-indent" />
                ))}
                <span className="tree-icon">{isDir ? "▸" : "◆"}</span>
                <span className="tree-name">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="code-panel">
        {!selectedPath && (
          <div className="empty" style={{ minHeight: 120 }}>
            <p>Select a file to view</p>
          </div>
        )}
        {selectedPath && (
          <>
            <div className="code-file-header">
              <div className="code-file-titlebar">
                <span className="code-file-arrow">▸</span>
                <span className="code-file-path">{selectedPath}</span>
              </div>
              <div className="code-block">
                <pre>{fileContent || "Loading..."}</pre>
              </div>
            </div>

            {/* ── Connections panel ── */}
            {(localLinks.length > 0 || pkgLinks.length > 0) && (
              <div className="connections-card">
                <div className="connections-header">
                  <span className="connections-title">⎇ connected to</span>
                </div>
                <div className="connections-body">
                  {localLinks.length > 0 && (
                    <div className="connections-group">
                      <span className="connections-group-label">files</span>
                      <div className="connections-chips">
                        {localLinks.map((l) => (
                          <button
                            key={l.raw}
                            className={`conn-chip local ${l.resolved ? "navigable" : "missing"}`}
                            onClick={() => l.resolved && onSelectFile(l.resolved)}
                            disabled={!l.resolved}
                            title={l.resolved || l.raw}
                          >
                            <span className="conn-chip-icon">◆</span>
                            {l.raw.replace(/^\.\.?\//, "")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {pkgLinks.length > 0 && (
                    <div className="connections-group">
                      <span className="connections-group-label">packages</span>
                      <div className="connections-chips">
                        {pkgLinks.map((l) => (
                          <span key={l.raw} className="conn-chip pkg" title={l.raw}>
                            <span className="conn-chip-icon">▪</span>
                            {l.raw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Claude explains ── */}
            {(explanation || explaining) && (
              <div className={`explain-card ${explaining ? "loading" : ""}`}>
                <div className="explain-header">✶ Claude explains</div>
                <p>{explaining ? "Getting AI explanation…" : explanation}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
