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
import BrainTab from "./components/BrainTab.jsx";
import StatusBar from "./components/StatusBar.jsx";
import Toast from "./components/Toast.jsx";
import { useToast } from "./hooks/useToast.js";
import { useProjectLog } from "./hooks/useProjectLog.js";
import { useRepoBrowser } from "./hooks/useRepoBrowser.js";
import { useBrain } from "./hooks/useBrain.js";
import { PROJ_COLORS, getProjectOverview } from "./api/github.js";

const TABS = ["input", "questions", "tasks", "output", "code", "brain"];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("gh_token") || "");
  const [tokenInput, setTokenInput] = useState("");
  const [repos, setRepos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gh_repos") || "[]"); }
    catch { return []; }
  });
  const [repoInput, setRepoInput] = useState("");
  const [activeRepo, setActiveRepo] = useState(null);
  const [tab, setTab] = useState("input");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem("anthropic_key") || "");

  const [brainRepo, setBrainRepo] = useState(() => localStorage.getItem("brain_repo") || "");

  const [storageType, setStorageType] = useState(() => localStorage.getItem("storage_type") || "github");
  const [webdavUrl, setWebdavUrl] = useState(() => localStorage.getItem("webdav_url") || "");
  const [webdavUser, setWebdavUser] = useState(() => localStorage.getItem("webdav_user") || "");
  const [webdavPass, setWebdavPass] = useState(() => localStorage.getItem("webdav_pass") || "");

  const storage = storageType === "webdav"
    ? { type: "webdav", baseUrl: webdavUrl, credentials: { user: webdavUser, pass: webdavPass } }
    : { type: "github" };

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Ready");
  const [statusOk, setStatusOk] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

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
  const brain = useBrain({ token, brainRepo });

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
        setLastUpdated(l.lastUpdated ? new Date(l.lastUpdated) : null);
        setStatusMsg(l.lastUpdated ? new Date(l.lastUpdated).toLocaleString() : "never");
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

  useEffect(() => {
    if (!activeRepo) return;
    setLoading(false);
    setOverview(null);
    if (!token || !anthropicKey) return;
    setOverviewLoading(true);
    getProjectOverview(token, activeRepo, anthropicKey)
      .then((text) => setOverview(text))
      .finally(() => setOverviewLoading(false));
  }, [activeRepo, token, anthropicKey]);

  useEffect(() => {
    if (tab === "brain") {
      brain.loadWiki();
      return;
    }
    if (!activeRepo) return;
    if (tab === "code") loadTree();
    else loadLog();
  }, [activeRepo, tab, loadLog, loadTree]);

  useEffect(() => {
    const handleKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") setSidebarOpen(false);
      if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        if (tab === "code") loadTree();
        else loadLog();
      }
      if (e.key === "n" && activeRepo) {
        document.querySelector(".input-box textarea")?.focus();
      }
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= 6 && TABS[numKey - 1]) setTab(TABS[numKey - 1]);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeRepo, tab, loadTree, loadLog]);

  const pendingCount = projectLog.todoTasks.length + projectLog.blockedTasks.length + projectLog.questionTasks.length;
  const displayTree = tab === "code" ? repoBrowser.buildDisplayTree() : [];

  const activeRepoIndex = repos.indexOf(activeRepo);
  const activeColor = activeRepoIndex >= 0 ? PROJ_COLORS[activeRepoIndex % PROJ_COLORS.length] : PROJ_COLORS[0];
  const storageLabel = storageType === "webdav" ? (webdavUrl || "nas.local") : (activeRepo || "");
  const activeProjectName = activeRepo ? (activeRepo.split("/")[1] || activeRepo) : "No project";

  return (
    <div className="shell">
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
        brainRepo={brainRepo}
        setBrainRepo={(r) => { setBrainRepo(r); localStorage.setItem("brain_repo", r); }}
        storageType={storageType}
        setStorageType={(t) => { setStorageType(t); localStorage.setItem("storage_type", t); }}
        webdavUrl={webdavUrl}
        setWebdavUrl={(v) => { setWebdavUrl(v); localStorage.setItem("webdav_url", v); }}
        webdavUser={webdavUser}
        setWebdavUser={(v) => { setWebdavUser(v); localStorage.setItem("webdav_user", v); }}
        webdavPass={webdavPass}
        setWebdavPass={(v) => { setWebdavPass(v); localStorage.setItem("webdav_pass", v); }}
        onShowToast={showToast}
      />

      <div className="main">
        {/* Mobile topbar */}
        <div className="topbar-mobile">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {activeRepo && <span className="proj-dot-sm" style={{ background: activeColor, boxShadow: `0 0 0 3px ${activeColor}22` }} />}
            <span className="topbar-project-name">{activeProjectName}</span>
          </div>
          <div style={{ width: 38 }} />
        </div>

        {/* Desktop header */}
        <div className="desk-header">
          {activeRepo && <span className="proj-dot-sm" style={{ background: activeColor, boxShadow: `0 0 0 3px ${activeColor}22` }} />}
          <span className="desk-header-name">{activeProjectName}</span>
          {activeRepo && <span className="desk-header-storage">{storageLabel}</span>}
        </div>

        {/* Tabs strip */}
        <div className="tabs-strip">
          {TABS.map((t) => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "questions" && projectLog.questionTasks.length > 0 && (
                <span className="tab-badge">{projectLog.questionTasks.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="content">
          <div className="content-inner">
            {!activeRepo && (
              <div className="empty">
                <div className="empty-icon">📦</div>
                <h2>No project selected</h2>
                <p>Add a GitHub repo in the sidebar and select it. Claude Code will read and write to project-log.json in the repo.</p>
              </div>
            )}

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
                overview={overview}
                overviewLoading={overviewLoading}
              />
            )}

            {activeRepo && tab === "questions" && (
              <QuestionsTab
                questionTasks={projectLog.questionTasks}
                log={projectLog.log}
                loading={loading}
                onAnswer={projectLog.answerQuestion}
              />
            )}

            {activeRepo && tab === "output" && (
              <OutputTab
                outputTasks={projectLog.outputTasks}
                log={projectLog.log}
                loading={loading}
              />
            )}

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

            {activeRepo && tab === "code" && (
              <CodeExplorer
                displayTree={displayTree}
                tree={repoBrowser.tree}
                treeError={repoBrowser.treeError}
                loading={loading}
                selectedPath={repoBrowser.selectedPath}
                fileContent={repoBrowser.fileContent}
                explanation={repoBrowser.explanation}
                explaining={repoBrowser.explaining}
                onSelectFile={repoBrowser.selectFile}
                onRetry={loadTree}
              />
            )}

            {tab === "brain" && (
              <BrainTab
                brainRepo={brainRepo}
                wikiFiles={brain.wikiFiles}
                rawCount={brain.rawCount}
                selectedFile={brain.selectedFile}
                fileContent={brain.fileContent}
                loadingList={brain.loadingList}
                loadingFile={brain.loadingFile}
                pushing={brain.pushing}
                onLoadWiki={brain.loadWiki}
                onSelectFile={brain.selectFile}
                onPushRaw={brain.pushRaw}
                onShowToast={showToast}
              />
            )}
          </div>
        </div>

        <StatusBar statusMsg={statusMsg} statusOk={statusOk} lastUpdated={lastUpdated} loading={loading} />
      </div>

      <Toast toast={toast} />
    </div>
  );
}
