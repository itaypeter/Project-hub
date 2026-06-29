import { useState } from "react";
import { SkeletonCard } from "./Skeleton.jsx";

export function TaskCard({ task, showCheck = false, onToggle }) {
  return (
    <div className="task-card">
      {showCheck ? (
        <button
          className={`task-check ${task.status === "done" ? "checked" : ""}`}
          onClick={() => onToggle?.(task.id)}
        >
          {task.status === "done" ? "✓" : ""}
        </button>
      ) : (
        <div className={`task-status-dot ${task.status}`} />
      )}
      <div className="task-body">
        <div className={`task-title ${task.status === "done" ? "done" : ""}`}>
          {task.title}
        </div>
        <div className="task-meta">
          {task.createdAt && <span>{new Date(task.createdAt).toLocaleDateString()}</span>}
          {task.source === "user" && <span> · you</span>}
          {task.source === "claude-code" && <span> · claude</span>}
          {task.completedAt && <span> · done {new Date(task.completedAt).toLocaleDateString()}</span>}
        </div>
        {task.note && <div className="output-note">{task.note}</div>}
      </div>
    </div>
  );
}

function OutputCard({ task }) {
  const commitUrl = task.commitUrl || null;
  const commitHash = commitUrl ? commitUrl.split("/commit/")[1]?.slice(0, 7) : null;
  const branch = task.branch || "main";

  return (
    <div className="output-card">
      <div className="output-header">
        <div className="output-title">{task.title}</div>
        <div className="output-time">
          {task.completedAt ? new Date(task.completedAt).toLocaleString() : task.createdAt ? new Date(task.createdAt).toLocaleString() : ""}
        </div>
      </div>
      {task.note && <div className="output-note-text">{task.note}</div>}
      {(commitHash || branch) && (
        <div>
          <span className="output-commit">
            <span className="output-branch-icon">⎇</span>
            {branch}
            {commitHash && <span className="output-commit-hash">{commitHash}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ paddingTop: 8 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} lines={1} />
      ))}
    </div>
  );
}

export function InputTab({ idea, setIdea, pushInput, pushing, inputTasks, log, loading, onToggle, overview, overviewLoading }) {
  if (!log && loading) return <LoadingState />;

  return (
    <>
      <div className="overview-card">
        <div className="overview-label">🧠 Project overview</div>
        {overviewLoading ? (
          <div className="skeleton-line" style={{ height: 11, width: "80%", marginTop: 4 }} />
        ) : overview ? (
          <p className="overview-text">{overview}</p>
        ) : (
          <p className="overview-text" style={{ color: "#484F58" }}>
            Add a Claude API key in the sidebar to get an auto-generated overview of this codebase.
          </p>
        )}
      </div>
      <div className="input-box">
        <label>New input</label>
        <textarea
          placeholder="Drop an idea, note, or instruction for Claude to pick up…"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <div className="input-actions">
          <button className="push-btn" onClick={() => pushInput(idea)} disabled={pushing || !idea.trim()}>
            {pushing ? "Pushing..." : "Push input →"}
          </button>
        </div>
      </div>

      {inputTasks.length > 0 && (
        <>
          <div className="section-label" style={{ marginBottom: 12, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6E7681" }}>
            Pushed inputs
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {inputTasks.map((t) => (
              <div key={t.id} className="input-item">
                <span className="input-dot" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="input-text">{t.title}</div>
                  <div className="input-time">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {log && inputTasks.length === 0 && (
        <div className="empty">
          <div className="empty-icon">✶</div>
          <h2>Nothing pushed yet</h2>
          <p>Write an idea or instruction above and push it. Claude Code will pick it up from project-log.json.</p>
        </div>
      )}
    </>
  );
}

export function TasksTab({ todoTasks, doneTasks, blockedTasks, tasks, log, loading, onToggle }) {
  if (!log && loading) return <LoadingState />;
  if (!log) return (
    <div className="empty">
      <div className="empty-icon">📋</div>
      <h2>No tasks yet</h2>
      <p>Tasks appear here once Claude Code starts working. Make sure your GitHub token is saved and the repo has a project-log.json.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {todoTasks.length > 0 && (
        <div>
          <div className="section-label">
            <span className="section-label-dot" style={{ background: "var(--amber)" }} />
            <span className="section-label-text">To do</span>
            <span className="section-count">{todoTasks.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todoTasks.map((t) => <TaskCard key={t.id} task={t} showCheck onToggle={onToggle} />)}
          </div>
        </div>
      )}

      {blockedTasks.length > 0 && (
        <div>
          <div className="section-label">
            <span className="section-label-dot" style={{ background: "var(--red)" }} />
            <span className="section-label-text">Blocked</span>
            <span className="section-count">{blockedTasks.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {blockedTasks.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {doneTasks.length > 0 && (
        <div>
          <div className="section-label">
            <span className="section-label-dot" style={{ background: "var(--emerald)" }} />
            <span className="section-label-text">Done</span>
            <span className="section-count">{doneTasks.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {doneTasks.map((t) => <TaskCard key={t.id} task={t} showCheck onToggle={onToggle} />)}
          </div>
        </div>
      )}

      {todoTasks.length === 0 && blockedTasks.length === 0 && doneTasks.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <h2>No tasks yet</h2>
          <p>Add inputs from the Input tab, or let Claude Code create tasks in project-log.json.</p>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ task, onAnswer }) {
  const [answering, setAnswering] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [choice, setChoice] = useState(null);
  const [custom, setCustom] = useState("");

  const handleAnswer = async (answer) => {
    if (!answer.trim() || answering) return;
    setAnswering(true);
    try {
      await onAnswer(task.id, answer.trim());
      setChoice(answer.trim());
      setAnswered(true);
    } finally {
      setAnswering(false);
    }
  };

  const isAnswered = answered || task.status === "done";
  const displayChoice = choice || task.answer;

  return (
    <div className={`question-card ${isAnswered ? "answered" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
        <span className={`question-tag ${isAnswered ? "answered" : "open"}`}>
          {isAnswered ? "Answered" : "Needs you"}
        </span>
        <span className="question-time">
          {task.createdAt ? new Date(task.createdAt).toLocaleString() : ""}
        </span>
      </div>
      <div className="question-title">{task.title}</div>
      {task.note && <div className="output-note" style={{ marginBottom: 14 }}>{task.note}</div>}

      {isAnswered ? (
        <div className="question-answered">
          <span style={{ color: "var(--emerald)", fontSize: 15 }}>✓</span>
          <span className="question-answered-text">
            You chose <strong style={{ color: "var(--text)" }}>{displayChoice}</strong>
          </span>
        </div>
      ) : task.options?.length > 0 ? (
        <div className="question-options">
          {task.options.map((opt) => (
            <button key={opt} className="option-btn" onClick={() => handleAnswer(opt)} disabled={answering}>
              <span className="option-radio" />
              <span>{opt}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input
            className="s-input"
            placeholder="Your answer..."
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && custom.trim() && handleAnswer(custom)}
          />
          <button className="s-btn" onClick={() => handleAnswer(custom)} disabled={answering || !custom.trim()}>
            {answering ? "..." : "Answer"}
          </button>
        </div>
      )}
    </div>
  );
}

export function QuestionsTab({ questionTasks, log, loading, onAnswer }) {
  if (!log && loading) return <LoadingState />;

  const allAnswered = log && questionTasks.length === 0;

  return (
    <>
      {questionTasks.map((t) => (
        <QuestionCard key={t.id} task={t} onAnswer={onAnswer} />
      ))}
      {allAnswered && (
        <div className="empty">
          <div className="empty-icon">✶</div>
          <h2>All caught up</h2>
          <p>New questions from Claude will land here.</p>
        </div>
      )}
    </>
  );
}

export function OutputTab({ outputTasks, log, loading }) {
  if (!log && loading) return <LoadingState />;

  return (
    <>
      {outputTasks.map((t) => (
        <OutputCard key={t.id} task={t} />
      ))}
      {outputTasks.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🤖</div>
          <h2>No output yet</h2>
          <p>Claude Code hasn't written anything yet. Push an idea in the Input tab, then run Claude Code in your repo — it will read your inputs and report results here.</p>
        </div>
      )}
    </>
  );
}
