import { useState } from "react";
import { PROJ_COLORS, pushClaudeMd } from "../api/github.js";

export default function Sidebar({
  token, tokenInput, setTokenInput, saveToken, setToken,
  repos, repoInput, setRepoInput, addRepo, removeRepo,
  activeRepo, setActiveRepo, pendingCount, sidebarOpen, setSidebarOpen,
  anthropicKey, setAnthropicKey,
  storageType, setStorageType,
  webdavUrl, setWebdavUrl,
  webdavUser, setWebdavUser,
  webdavPass, setWebdavPass,
  brainRepo, setBrainRepo,
  onShowToast,
}) {
  const isWebDAV = storageType === "webdav";
  const [settingUp, setSettingUp] = useState(null);
  const [brainInput, setBrainInput] = useState("");

  const handleSetup = async (e, repo) => {
    e.stopPropagation();
    if (!token) { onShowToast?.("Add a GitHub token first", "error"); return; }
    setSettingUp(repo);
    try {
      await pushClaudeMd(token, repo, brainRepo || null);
      onShowToast?.(`CLAUDE.md pushed to ${repo}${brainRepo ? " (with brain)" : ""}`, "success");
    } catch (err) {
      onShowToast?.(`Failed: ${err.message}`, "error");
    } finally {
      setSettingUp(null);
    }
  };

  const saveBrain = () => {
    const r = brainInput.trim();
    if (!r) return;
    setBrainRepo(r);
    setBrainInput("");
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">Project<span>//</span>Hub</div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="sidebar-scroll">
          {/* Storage toggle */}
          <span className="sidebar-label">Storage</span>
          <div className="storage-toggle">
            <button className={`storage-btn ${!isWebDAV ? "active" : ""}`} onClick={() => setStorageType("github")}>
              GitHub
            </button>
            <button className={`storage-btn ${isWebDAV ? "active" : ""}`} onClick={() => setStorageType("webdav")}>
              NAS / WebDAV
            </button>
          </div>

          {/* GitHub fields */}
          {!isWebDAV && (
            <div style={{ marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="sidebar-label">GitHub token</span>
              {token ? (
                <div className="connected-badge">
                  <span>● Connected</span>
                  <button onClick={() => { setToken(""); localStorage.removeItem("gh_token"); }}>change</button>
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
                  <button className="s-btn" onClick={saveToken} style={{ marginTop: 2 }}>Save Token</button>
                </>
              )}
            </div>
          )}

          {/* WebDAV fields */}
          {isWebDAV && (
            <div style={{ marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="sidebar-label">WebDAV URL</span>
              <input className="s-input" type="text" placeholder="https://nas.local/dav" value={webdavUrl} onChange={(e) => setWebdavUrl(e.target.value)} />
              <div style={{ display: "flex", gap: 8 }}>
                <input className="s-input" placeholder="user" value={webdavUser} onChange={(e) => setWebdavUser(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
                <input className="s-input" type="password" placeholder="pass" value={webdavPass} onChange={(e) => setWebdavPass(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
              </div>
            </div>
          )}

          {/* Claude API key */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            <span className="sidebar-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Claude API key
              <span style={{ color: "#484F58", fontSize: 9, letterSpacing: "0.5px", textTransform: "none", fontFamily: "inherit" }}>optional · AI features</span>
            </span>
            {anthropicKey ? (
              <div className="connected-badge">
                <span style={{ color: "var(--accent-hi)" }}>● AI ready</span>
                <button onClick={() => { setAnthropicKey(""); localStorage.removeItem("anthropic_key"); }}>change</button>
              </div>
            ) : (
              <input
                className="s-input"
                type="password"
                placeholder="sk-ant-..."
                onChange={(e) => { localStorage.setItem("anthropic_key", e.target.value); setAnthropicKey(e.target.value); }}
              />
            )}
          </div>

          {/* Projects */}
          <div className="sidebar-projects-header">
            <span className="sidebar-label" style={{ marginBottom: 0 }}>Projects</span>
            <span className="proj-count-label">{repos.length}</span>
          </div>
          <div className="proj-list">
            {repos.length === 0 && (
              <div style={{ padding: "10px 0", color: "var(--muted)", fontSize: 12, fontFamily: "var(--mono)" }}>
                Add a project to get started
              </div>
            )}
            {repos.map((r, i) => {
              const color = PROJ_COLORS[i % PROJ_COLORS.length];
              const isActive = activeRepo === r;
              const name = r.split("/")[1] || r;
              const isLoading = settingUp === r;
              return (
                <div key={r} className={`proj-item ${isActive ? "active" : ""}`} onClick={() => { setActiveRepo(r); setSidebarOpen(false); }}>
                  <span className="proj-dot" style={{ background: color, boxShadow: `0 0 0 3px ${color}22` }} />
                  <span className="proj-name">{name}</span>
                  {isActive && pendingCount > 0 && (
                    <span className="proj-badge">{pendingCount}</span>
                  )}
                  {!isWebDAV && token && (
                    <button
                      className="setup-btn"
                      onClick={(e) => handleSetup(e, r)}
                      disabled={isLoading}
                      title="Push CLAUDE.md — gives Claude full autonomous workflow instructions"
                    >
                      {isLoading ? "…" : "⚙ Setup"}
                    </button>
                  )}
                  <button
                    className="remove-btn"
                    onClick={(e) => { e.stopPropagation(); removeRepo(r); }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add project */}
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="s-input"
              placeholder={isWebDAV ? "project-name" : "owner/repo"}
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRepo()}
              style={{ flex: 1 }}
            />
            <button className="s-btn-add" onClick={addRepo}>+</button>
          </div>

          {repos.length > 0 && !isWebDAV && token && (
            <div style={{ marginTop: 10, fontSize: 11, color: "#484F58", fontFamily: "var(--mono)", lineHeight: 1.5 }}>
              ⚙ Setup pushes CLAUDE.md to a repo so Claude knows to scan your code, plan tasks, test with Playwright, and report back automatically.
            </div>
          )}

          {/* Brain repo */}
          <div className="brain-sidebar-section">
            <div className="sidebar-projects-header" style={{ marginBottom: 10 }}>
              <span className="sidebar-label" style={{ marginBottom: 0 }}>🧠 Brain</span>
            </div>
            {brainRepo ? (
              <div className="brain-repo-badge">
                <span className="brain-repo-name">{brainRepo}</span>
                <button
                  className="remove-btn"
                  style={{ opacity: 1 }}
                  onClick={() => setBrainRepo("")}
                  title="Disconnect brain"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="s-input"
                    placeholder="owner/brain-repo"
                    value={brainInput}
                    onChange={(e) => setBrainInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveBrain()}
                    style={{ flex: 1 }}
                  />
                  <button className="s-btn-add" onClick={saveBrain}>+</button>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#484F58", fontFamily: "var(--mono)", lineHeight: 1.5 }}>
                  A SimpleBrain repo — business knowledge wiki Claude reads before every task.
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
