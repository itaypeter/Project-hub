import { getFileIcon } from "../api/github.js";
import { SkeletonTree } from "./Skeleton.jsx";

export default function CodeExplorer({
  displayTree,
  loading,
  selectedPath,
  fileContent,
  explanation,
  explaining,
  onSelectFile,
}) {
  return (
    <div className="explorer">
      <div className="file-tree">
        {displayTree.length === 0 && loading && <SkeletonTree count={8} />}
        {displayTree.map((item) => {
          const parts = item.path.split("/");
          const depth = parts.length - 1;
          const name = parts[parts.length - 1];
          const isDir = item.type === "tree";
          return (
            <div
              key={item.path}
              className={`tree-item ${
                selectedPath === item.path ? "selected" : ""
              }`}
              onClick={() => !isDir && onSelectFile(item.path)}
            >
              {Array.from({ length: depth }).map((_, i) => (
                <span key={i} className="tree-indent" />
              ))}
              <span className="tree-icon">
                {isDir ? "📁" : getFileIcon(name)}
              </span>
              <span>{name}</span>
            </div>
          );
        })}
      </div>
      <div className="code-panel">
        {!selectedPath && (
          <div className="empty">
            <p>Select a file to view</p>
          </div>
        )}
        {selectedPath && (
          <>
            {explanation && (
              <div className="explain-card">
                <h3>{selectedPath}</h3>
                <p>{explanation}</p>
              </div>
            )}
            {explaining && (
              <div className="explain-card loading">
                <h3>{selectedPath}</h3>
                <p>Getting AI explanation...</p>
              </div>
            )}
            <div className="code-block">
              <pre>{fileContent || "Loading..."}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
