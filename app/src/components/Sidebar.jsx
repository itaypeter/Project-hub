import { PROJ_COLORS } from "../api/github.js";

export default function Sidebar({
  token, tokenInput, setTokenInput, saveToken, setToken,
  repos, repoInput, setRepoInput, addRepo, removeRepo,
  activeRepo, setActiveRepo, pendingCount, sidebarOpen, setSidebarOpen,
  anthropicKey, setAnthropicKey,
  storageType, setStorageType,
  webdavUrl, setWebdavUrl,
  webdavUser, setWebdavUser,
  webdavPass, setWebdavPass,
}) {
  const isWebDAV = storageType === "webdav";
  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">Project<span>//</span>Hub</div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Storage backend toggle */}
        <div className="sidebar-section">
          <label>Storage</label>
          <div className="storage-toggle">
            <button
              className={`storage-btn ${!isWebDAV ? "active" : ""}`}
              onClick={() => setStorageType("github")}
            >
              GitHub
            </button>
            <button
              className={`storage-btn ${isWebDAV ? "active" : ""}`}
              onClick={() => setStorageType("webdav")}
            >
              NAS / WebDAV
            </button>
          </div>
        </div>

        {/* GitHub Token */}
        {!isWebDAV && (
          <div className="sidebar-section">
            <label>GitHub Token</label>
            {token ? (
              <div className="connected-badge">
                <span>● Connected</span>
                <button onClick={() => { setToken(""); localStorage.removeItem("gh_token"); }}>
                  change
                </button>
              </div>
            ) : (
              <>
                <input
                  className="s-input"
                  type="password"
                  placeholder="ghp_..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveToken()}
                />
                <button className="s-btn" onClick={saveToken} style={{ width: "100%", marginTop: 6 }}>
                  Save Token
                </button>
              </>
            )}
          </div>
        )}

        {/* WebDAV config */}
        {isWebDAV && (
          <div className="sidebar-section">
            <label>NAS WebDAV URL</label>
            <input
              className="s-input"
              placeholder="http://192.168.1.x:5005/"
              value={webdavUrl}
              onChange={(e) => setWebdavUrl(e.target.value)}
              style={{ marginBottom: 6 }}
            />
            <label style={{ marginTop: 8 }}>Username</label>
            <input
              className="s-input"
              placeholder="admin"
              value={webdavUser}
              onChange={(e) => setWebdavUser(e.target.value)}
              style={{ marginBottom: 6 }}
            />
            <label style={{ marginTop: 8 }}>Password</label>
            <input
              className="s-input"
              type="password"
              placeholder="••••••••"
              value={webdavPass}
              onChange={(e) => setWebdavPass(e.target.value)}
            />
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}>
              Each project folder on your NAS should contain project-log.json
            </div>
          </div>
        )}

        {/* Anthropic API Key */}
        <div className="sidebar-section">
          <label>Claude API Key (optional)</label>
          {anthropicKey ? (
            <div className="connected-badge">
              <span style={{ color: "var(--accent-hi)" }}>● AI ready</span>
              <button onClick={() => { setAnthropicKey(""); localStorage.removeItem("anthropic_key"); }}>
                change
              </button>
            </div>
          ) : (
            <input
              className="s-input"
              type="password"
              placeholder="sk-ant-..."
              value={localStorage.getItem("anthropic_key") || ""}
              onChange={(e) => {
                localStorage.setItem("anthropic_key", e.target.value);
                setAnthropicKey(e.target.value);
              }}
            />
          )}
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}>
            Enables AI file explanations in Code Explorer
          </div>
        </div>

        {/* Repos / Folders */}
        <div className="sidebar-section">
          <label>{isWebDAV ? "Add Folder" : "Add Repo"}</label>
          <div className="input-row">
            <input
              className="s-input"
              placeholder={isWebDAV ? "project-name" : "owner/repo"}
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRepo()}
            />
            <button className="s-btn" onClick={addRepo}>
              +
            </button>
          </div>
        </div>

        <div className="proj-list">
          {repos.length === 0 && (
            <div
              style={{
                padding: "16px",
                color: "var(--muted)",
                fontSize: 12,
              }}
            >
              Add a repo to get started
            </div>
          )}
          {repos.map((r, i) => (
            <div
              key={r}
              className={`proj-item ${activeRepo === r ? "active" : ""}`}
              onClick={() => {
                setActiveRepo(r);
                setSidebarOpen(false);
              }}
            >
              <span
                className="proj-dot"
                style={{
                  background:
                    PROJ_COLORS[i % PROJ_COLORS.length],
                }}
              />
              <span className="proj-name">{r.split("/")[1] || r}</span>
              {activeRepo === r && pendingCount > 0 && (
                <span className="proj-count">{pendingCount}</span>
              )}
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeRepo(r);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
