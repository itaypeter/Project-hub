import { useState, useEffect } from "react";

function timeAgo(date) {
  if (!date) return null;
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function StatusBar({ statusMsg, statusOk, lastUpdated, loading }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  const ago = lastUpdated ? timeAgo(lastUpdated) : null;

  return (
    <div className="status-bar">
      <div className="status-brand">Project<span>//</span>Hub</div>
      <div className="status-right">
        {loading ? (
          <span>loading…</span>
        ) : ago ? (
          <span>updated {ago}</span>
        ) : (
          <span>{statusMsg}</span>
        )}
        <span className={`pulse-dot ${statusOk ? "" : "err"}`} />
      </div>
    </div>
  );
}
