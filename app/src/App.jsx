import { useState, useEffect, useCallback } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar.jsx";
import {
  InputTab,
  QuestionsTab,
  TasksTab,
  OutputTab,
} from "./components/TaskPanel.jsx";
import CodeExplorer from "./components/CodeExplorer.jsx";
import StatusBar from "./components/StatusBar.jsx";
import Toast from "./components/Toast.jsx";
import { useToast } from "./hooks/useToast.js";
import { useProjectLog } from "./hooks/useProjectLog.js";
import { useRepoBrowser } from "./hooks/useRepoBrowser.js";

const TABS = ["input", "questions", "tasks", "output", "code"];

export default function App() {
  // ── Shared state ──
  const [token, setToken] = useState(
    () => localStorage.getItem("gh_token") || ""
  );
  const [tokenInput, setTokenInput] = useState("");
  const [repos, setRepos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gh_repos") || "[]");
    } catch {
      return [];
    }
  });
  const [repoInput, setRepoInput] = useState("");
  const [activeRepo, setActiveRepo] = useState(null);
  const [tab, setTab] = useState("input");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState(
    () => localStorage.getItem("anthropic_key") || ""
  );

  const [storageType, setStorageType] = useState(
    () => localStorage.getItem("storage_type") || "github"
  );
  const [webdavUrl, setWebdavUrl] = useState(
    () => localStorage.getItem("webdav_url") || ""
  );
  const [webdavUser, setWebdavUser] = useState(
    () => localStorage.getItem("webdav_user") || ""
  );
  const [webdavPass, setWebdavPass] = useState(
    () => localStorage.getItem("webdav_pass") || ""
  );

  const storage =
    storageType === "webdav"
      ? { type: "webdav", baseUrl: webdavUrl, credentials: { user: webdavUser, pass: webdavPass } }
      : { type: "github" };

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Ready");
  const [statusOk, setStatusOk] = useState(true);

  // ── Hooks ──
  const { toast, showToast } = useToast();
  const projectLog = useProjectLog({
    token,
    activeRepo,
    storage,
    onNewQuestion: (count) => {
      showToast(`Claude has ${count} question${count > 1 ? "s" : ""} for you`);
      setTab("questions");
    },
  });
  const repoBrowser = useRepoBrowser({ token, activeRepo, anthropicKey });

  // ── Handlers ──
  const saveToken = () => {
    localStorage.setItem("gh_token", tokenInput);
    setToken(tokenInput);
    setTokenInput("");
    showToast("Token saved");
  };

  const addRepo = () => {
    const r = repoInput.trim();
    if (!r || repos.includes(r)) return;
    const next = [...repos, r];
    setRepos(next);
    localStorage.setItem("gh_repos", JSON.stringify(next));
    setRepoInput("");
    setActiveRepo(r);
    setSidebarOpen(false);
  };

  const removeRepo = (r) => {
    const next = repos.filter((x) => x !== r);
    setRepos(next);
    localStorage.setItem("gh_repos", JSON.stringify(next));
    if (activeRepo === r) setActiveRepo(next[0] || null);
  };

  const loadLog = useCallback(async () => {
    if (!token || !activeRepo) return;
    setLoading(true);
    setStatusMsg("Loading...");
    try {
      const l = await projectLog.loadLog();
      if (l) {
        setStatusMsg(
          `Last updated: ${
            l.lastUpdated
              ? new Date(l.lastUpdated).toLocaleString()
              : "never"
          }`
        );
        setStatusOk(true);
      }
    } catch (e) {
      setStatusMsg(e.message);
      setStatusOk(false);
    } finally {
      setLoading(false);
    }
  }, [token, activeRepo, projectLog]);

  const loadTree = useCallback(async () => {
    if (!token || !activeRepo) return;
    setLoading(true);
    try {
      await repoBrowser.loadTree();
    } catch (e) {
      setStatusMsg(e.message);
      setStatusOk(false);
    } finally {
      setLoading(false);
    }
  }, [token, activeRepo, repoBrowser]);

  // ── Effects ──
  useEffect(() => {
    if (!activeRepo) return;
    setLoading(false);
  }, [activeRepo]);

  useEffect(() => {
    if (!activeRepo) return;
    if (tab === "code") loadTree();
    else loadLog();
  }, [activeRepo, tab, loadLog, loadTree]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
        return;

      if (e.key === "Escape") setSidebarOpen(false);

      if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        if (tab === "code") loadTree();
        else loadLog();
      }

      if (e.key === "n" && activeRepo) {
        document.querySelector(".input-box textarea")?.focus();
      }

      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= 5) {
        const idx = numKey - 1;
        if (TABS[idx]) setTab(TABS[idx]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeRepo, tab, loadTree, loadLog]);

  // ── Derived ──
  const pendingCount =
    projectLog.todoTasks.length +
    projectLog.blockedTasks.length +
    projectLog.questionTasks.length;
  const displayTree =
    tab === "code" ? repoBrowser.buildDisplayTree() : [];

  return (
    <>
      <Sidebar
        token={token}
        tokenInput={tokenInput}
        setTokenInput={setTokenInput}
        saveToken={saveToken}
        setToken={setToken}
        repos={repos}
        repoInput={repoInput}
        setRepoInput={setRepoInput}
        addRepo={addRepo}
        removeRepo={removeRepo}
        activeRepo={activeRepo}
        setActiveRepo={setActiveRepo}
        pendingCount={pendingCount}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        anthropicKey={anthropicKey}
        setAnthropicKey={setAnthropicKey}
        storageType={storageType}
        setStorageType={(t) => { setStorageType(t); localStorage.setItem("storage_type", t); }}
        webdavUrl={webdavUrl}
        setWebdavUrl={(v) => { setWebdavUrl(v); localStorage.setItem("webdav_url", v); }}
        webdavUser={webdavUser}
        setWebdavUser={(v) => { setWebdavUser(v); localStorage.setItem("webdav_user", v); }}
        webdavPass={webdavPass}
        setWebdavPass={(v) => { setWebdavPass(v); localStorage.setItem("webdav_pass", v); }}
      />

      <main className="main">
        {/* ── Top bar ── */}
        <div className="topbar">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          {activeRepo ? (
            <>
              <h1>{activeRepo.split("/")[1]}</h1>
              <span className="repo-label">{activeRepo}</span>
              <div className="tabs">
                {TABS.map((t) => (
                  <button
                    key={t}
                    className={`tab ${tab === t ? "active" : ""}`}
                    onClick={() => setTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                    {t === "questions" && projectLog.questionTasks.length > 0 && (
                      <span className="tab-badge">{projectLog.questionTasks.length}</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                className="refresh-btn"
                onClick={tab === "code" ? loadTree : loadLog}
              >
                <span className={loading ? "spinning" : ""}>⟳</span>
              </button>
            </>
          ) : (
            <h1 style={{ color: "var(--muted)" }}>Select a project</h1>
          )}
        </div>

        {/* ── Content ── */}
        <div className="content">
          {/* Empty state */}
          {!activeRepo && (
            <div className="empty">
              <div className="empty-icon">📦</div>
              <h2>No project selected</h2>
              <p>
                Add a GitHub repo in the sidebar and select it. Claude Code
                will read and write to project-log.json in the repo.
              </p>
            </div>
          )}

          {/* Input tab */}
          {activeRepo && tab === "input" && (
            <InputTab
              idea={projectLog.idea}
              setIdea={projectLog.setIdea}
              pushInput={projectLog.pushInput}
              pushing={projectLog.pushing}
              inputTasks={projectLog.inputTasks}
              log={projectLog.log}
              loading={loading}
              onToggle={projectLog.toggleTask}
            />
          )}

          {/* Questions tab */}
          {activeRepo && tab === "questions" && (
            <QuestionsTab
              questionTasks={projectLog.questionTasks}
              log={projectLog.log}
              loading={loading}
              onAnswer={projectLog.answerQuestion}
            />
          )}

          {/* Output tab */}
          {activeRepo && tab === "output" && (
            <OutputTab
              outputTasks={projectLog.outputTasks}
              log={projectLog.log}
              loading={loading}
            />
          )}

          {/* Tasks tab */}
          {activeRepo && tab === "tasks" && (
            <TasksTab
              todoTasks={projectLog.todoTasks}
              doneTasks={projectLog.doneTasks}
              blockedTasks={projectLog.blockedTasks}
              tasks={projectLog.tasks}
              log={projectLog.log}
              loading={loading}
              onToggle={projectLog.toggleTask}
            />
          )}

          {/* Code tab */}
          {activeRepo && tab === "code" && (
            <CodeExplorer
              displayTree={displayTree}
              loading={loading}
              selectedPath={repoBrowser.selectedPath}
              fileContent={repoBrowser.fileContent}
              explanation={repoBrowser.explanation}
              explaining={repoBrowser.explaining}
              onSelectFile={repoBrowser.selectFile}
            />
          )}
        </div>

        <StatusBar
          statusMsg={statusMsg}
          statusOk={statusOk}
          activeRepo={activeRepo}
        />
      </main>

      <Toast toast={toast} />
    </>
  );
}
