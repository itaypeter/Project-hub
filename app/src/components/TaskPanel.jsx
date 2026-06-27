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
        <div
          className="task-title"
          style={
            task.status === "done"
              ? { textDecoration: "line-through", opacity: 0.6 }
              : {}
          }
        >
          {task.title}
        </div>
        <div className="task-meta">
          {task.createdAt && (
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          )}
          {task.source === "user" && <span> · you</span>}
          {task.source === "claude-code" && <span> · claude</span>}
          {task.completedAt && (
            <span>
              {" "}
              · done {new Date(task.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {task.note && <div className="output-note">{task.note}</div>}
      </div>
      <span className={`badge ${task.status}`}>{task.status}</span>
    </div>
  );
}

export function OutputCard({ task }) {
  return (
    <div className="output-card">
      <div className="output-title">{task.title}</div>
      <div className="output-meta">
        {task.createdAt && new Date(task.createdAt).toLocaleDateString()}
        {" · "}
        <span className={`badge ${task.status}`}>{task.status}</span>
      </div>
      {task.note && <div className="output-note">{task.note}</div>}
    </div>
  );
}

function LoadingState({ skeleton = "tasks" }) {
  if (skeleton === "tasks") {
    return (
      <div style={{ paddingTop: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={1} />
        ))}
      </div>
    );
  }
  return (
    <div className="empty">
      <div className="empty-icon spinning">⟳</div>
      <p>Loading...</p>
    </div>
  );
}

export function InputTab({
  idea,
  setIdea,
  pushInput,
  pushing,
  inputTasks,
  log,
  loading,
  onToggle,
}) {
  if (!log && loading) return <LoadingState skeleton="tasks" />;

  return (
    <>
      <div className="input-box">
        <label>New note / idea / task</label>
        <textarea
          placeholder="Write a note, idea, or task... Claude Code will pick it up from project-log.json"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <div className="input-actions">
          <button
            className="push-btn"
            onClick={() => pushInput(idea)}
            disabled={pushing || !idea.trim()}
          >
            {pushing ? "Pushing..." : "Push to GitHub"}
          </button>
        </div>
      </div>

      {inputTasks.length > 0 && (
        <div className="section-group">
          <div className="section-label">
            Your inputs{" "}
            <span className="section-count">{inputTasks.length}</span>
          </div>
          {inputTasks.map((t) => (
            <TaskCard key={t.id} task={t} onToggle={onToggle} />
          ))}
        </div>
      )}

      {log && inputTasks.length === 0 && (
        <div className="empty">
          <div className="empty-icon">✍️</div>
          <h2>No inputs yet</h2>
          <p>Write your first note above and push it to GitHub.</p>
        </div>
      )}
    </>
  );
}

export function TasksTab({
  todoTasks,
  doneTasks,
  blockedTasks,
  tasks,
  log,
  loading,
  onToggle,
}) {
  if (!log && loading) return <LoadingState skeleton="tasks" />;

  return (
    <>
      {todoTasks.length > 0 && (
        <div className="section-group">
          <div className="section-label">
            To do{" "}
            <span className="section-count">{todoTasks.length}</span>
          </div>
          {todoTasks.map((t) => (
            <TaskCard key={t.id} task={t} showCheck onToggle={onToggle} />
          ))}
        </div>
      )}

      {blockedTasks.length > 0 && (
        <div className="section-group">
          <div className="section-label">
            Blocked{" "}
            <span className="section-count">{blockedTasks.length}</span>
          </div>
          {blockedTasks.map((t) => (
            <TaskCard key={t.id} task={t} onToggle={onToggle} />
          ))}
        </div>
      )}

      {doneTasks.length > 0 && (
        <div className="section-group">
          <div className="section-label">
            Done{" "}
            <span className="section-count">{doneTasks.length}</span>
          </div>
          {doneTasks.map((t) => (
            <TaskCard key={t.id} task={t} showCheck onToggle={onToggle} />
          ))}
        </div>
      )}

      {log && tasks.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <h2>No tasks yet</h2>
          <p>
            Add inputs from the Input tab, or let Claude Code create tasks
            in project-log.json.
          </p>
        </div>
      )}
    </>
  );
}

function QuestionCard({ task, onAnswer }) {
  const [custom, setCustom] = useState("");
  const [answering, setAnswering] = useState(false);

  const handleAnswer = async (answer) => {
    if (!answer.trim()) return;
    setAnswering(true);
    try {
      await onAnswer(task.id, answer.trim());
    } finally {
      setAnswering(false);
    }
  };

  return (
    <div className="question-card">
      <div className="question-label">Claude needs your input</div>
      <div className="question-title">{task.title}</div>
      {task.note && <div className="output-note">{task.note}</div>}
      {task.options?.length > 0 ? (
        <div className="question-options">
          {task.options.map((opt) => (
            <button
              key={opt}
              className="option-btn"
              onClick={() => handleAnswer(opt)}
              disabled={answering}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="question-free">
          <input
            className="s-input"
            placeholder="Your answer..."
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && custom.trim() && handleAnswer(custom)
            }
          />
          <button
            className="s-btn"
            onClick={() => handleAnswer(custom)}
            disabled={answering || !custom.trim()}
          >
            {answering ? "..." : "Answer"}
          </button>
        </div>
      )}
      <div className="question-meta">
        {task.createdAt && new Date(task.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

export function QuestionsTab({ questionTasks, log, loading, onAnswer }) {
  if (!log && loading) return <LoadingState skeleton="tasks" />;

  return (
    <>
      {questionTasks.length > 0 && (
        <div className="section-group">
          <div className="section-label">
            Waiting for your answer{" "}
            <span className="section-count">{questionTasks.length}</span>
          </div>
          {questionTasks.map((t) => (
            <QuestionCard key={t.id} task={t} onAnswer={onAnswer} />
          ))}
        </div>
      )}
      {log && questionTasks.length === 0 && (
        <div className="empty">
          <div className="empty-icon">✅</div>
          <h2>No questions</h2>
          <p>
            Claude is working autonomously. When it needs a decision from
            you, it will appear here.
          </p>
        </div>
      )}
    </>
  );
}

export function OutputTab({ outputTasks, log, loading }) {
  if (!log && loading) return <LoadingState skeleton="tasks" />;

  return (
    <>
      {outputTasks.length > 0 && (
        <div className="section-group">
          <div className="section-label">
            Claude Code output{" "}
            <span className="section-count">{outputTasks.length}</span>
          </div>
          {outputTasks.map((t) => (
            <OutputCard key={t.id} task={t} />
          ))}
        </div>
      )}

      {log && outputTasks.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🤖</div>
          <h2>No output yet</h2>
          <p>
            Claude Code hasn't written anything yet. Run Claude Code in your
            repo — it will read your inputs and write results here.
          </p>
        </div>
      )}
    </>
  );
}
