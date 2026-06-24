import { useState, useCallback, useEffect } from "react";
import { getLog, putLog } from "../api/github.js";

export function useProjectLog({ token, activeRepo }) {
  const [log, setLog] = useState(null);
  const [logSha, setLogSha] = useState(null);
  const [idea, setIdea] = useState("");
  const [pushing, setPushing] = useState(false);

  const loadLog = useCallback(async () => {
    if (!token || !activeRepo) return null;
    const { log: l, sha } = await getLog(token, activeRepo);
    setLog(l);
    setLogSha(sha);
    return l;
  }, [token, activeRepo]);

  useEffect(() => {
    setLog(null);
    setLogSha(null);
    setIdea("");
    setPushing(false);
  }, [activeRepo]);

  const pushInput = useCallback(
    async (title) => {
      if (!title.trim() || !log || !token || !activeRepo) return false;
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
        // Re-fetch SHA to avoid stale-sha conflicts
        const { sha } = await getLog(token, activeRepo);
        await putLog(token, activeRepo, newLog, sha);
        setLog(newLog);
        setIdea("");
        return true;
      } finally {
        setPushing(false);
      }
    },
    [log, token, activeRepo]
  );

  const toggleTask = useCallback(
    async (taskId) => {
      if (!log || !token || !activeRepo) return;
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
      const newLog = {
        ...log,
        tasks: updatedTasks,
        lastUpdated: new Date().toISOString(),
      };
      const { sha } = await getLog(token, activeRepo);
      await putLog(token, activeRepo, newLog, sha);
      setLog(newLog);
    },
    [log, token, activeRepo]
  );

  const tasks = log?.tasks || [];
  const inputTasks = tasks.filter(
    (t) => t.source === "user" || t.type === "input" || t.status === "idea"
  );
  const outputTasks = tasks.filter(
    (t) => t.source === "claude-code" || t.type === "output"
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
    tasks,
    inputTasks,
    outputTasks,
    todoTasks,
    doneTasks,
    blockedTasks,
  };
}
