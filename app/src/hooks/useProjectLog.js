import { useState, useCallback, useEffect, useRef } from "react";
import { getLog, putLog } from "../api/github.js";
import { getLogWebDAV, putLogWebDAV } from "../api/webdav.js";

const POLL_INTERVAL = 45_000;

export function useProjectLog({ token, activeRepo, onNewQuestion, storage }) {
  // storage = { type: "github" } | { type: "webdav", baseUrl, credentials: {user, pass} }
  const [log, setLog] = useState(null);
  const [logSha, setLogSha] = useState(null);
  const [idea, setIdea] = useState("");
  const [pushing, setPushing] = useState(false);
  const prevQuestionCount = useRef(0);

  const loadLog = useCallback(async () => {
    if (!activeRepo) return null;
    if (storage?.type === "webdav") {
      const { log: l } = await getLogWebDAV(storage.baseUrl, storage.credentials, activeRepo);
      setLog(l);
      setLogSha(null);
      return l;
    }
    if (!token) return null;
    const { log: l, sha } = await getLog(token, activeRepo);
    setLog(l);
    setLogSha(sha);
    return l;
  }, [token, activeRepo, storage]);

  // Auto-refresh every 45s
  useEffect(() => {
    if (!token || !activeRepo) return;
    const id = setInterval(loadLog, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [token, activeRepo, loadLog]);

  // Notify when new questions arrive
  useEffect(() => {
    const questions = (log?.tasks || []).filter(
      (t) => t.type === "question" && t.status !== "done" && t.source === "claude-code"
    );
    if (questions.length > prevQuestionCount.current) {
      onNewQuestion?.(questions.length);
    }
    prevQuestionCount.current = questions.length;
  }, [log, onNewQuestion]);

  useEffect(() => {
    setLog(null);
    setLogSha(null);
    setIdea("");
    setPushing(false);
    prevQuestionCount.current = 0;
  }, [activeRepo]);

  const _putLog = useCallback(
    async (newLog) => {
      if (storage?.type === "webdav") {
        await putLogWebDAV(storage.baseUrl, storage.credentials, activeRepo, newLog);
        return;
      }
      const { sha } = await getLog(token, activeRepo);
      await putLog(token, activeRepo, newLog, sha);
    },
    [storage, token, activeRepo]
  );

  const pushInput = useCallback(
    async (title) => {
      if (!title.trim() || !log || !activeRepo) return false;
      if (storage?.type !== "webdav" && !token) return false;
      setPushing(true);
      try {
        const newTask = {
          id: Date.now(),
          title: title.trim(),
          status: "idea",
          createdAt: new Date().toISOString(),
          source: "user",
        };
        const newLog = {
          ...log,
          tasks: [...(log.tasks || []), newTask],
          lastUpdated: new Date().toISOString(),
        };
        await _putLog(newLog);
        setLog(newLog);
        setIdea("");
        return true;
      } finally {
        setPushing(false);
      }
    },
    [log, token, activeRepo, storage, _putLog]
  );

  const toggleTask = useCallback(
    async (taskId) => {
      if (!log || !activeRepo) return;
      const updatedTasks = log.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const newStatus = t.status === "done" ? "todo" : "done";
        return {
          ...t,
          status: newStatus,
          completedAt:
            newStatus === "done" ? new Date().toISOString() : undefined,
        };
      });
      const newLog = { ...log, tasks: updatedTasks, lastUpdated: new Date().toISOString() };
      await _putLog(newLog);
      setLog(newLog);
    },
    [log, activeRepo, _putLog]
  );

  const answerQuestion = useCallback(
    async (taskId, answer) => {
      if (!log || !activeRepo) return;
      const updatedTasks = log.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, status: "done", answer, answeredAt: new Date().toISOString() };
      });
      const newLog = { ...log, tasks: updatedTasks, lastUpdated: new Date().toISOString() };
      await _putLog(newLog);
      setLog(newLog);
    },
    [log, activeRepo, _putLog]
  );

  const tasks = log?.tasks || [];
  const questionTasks = tasks.filter(
    (t) => t.type === "question" && t.status !== "done" && t.source === "claude-code"
  );
  const inputTasks = tasks.filter(
    (t) => t.source === "user" || t.type === "input" || t.status === "idea"
  );
  const outputTasks = tasks.filter(
    (t) => (t.source === "claude-code" || t.type === "output") && t.type !== "question"
  );
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const blockedTasks = tasks.filter((t) => t.status === "blocked");

  return {
    log,
    logSha,
    idea,
    setIdea,
    pushing,
    loadLog,
    pushInput,
    toggleTask,
    answerQuestion,
    tasks,
    questionTasks,
    inputTasks,
    outputTasks,
    todoTasks,
    doneTasks,
    blockedTasks,
  };
}
