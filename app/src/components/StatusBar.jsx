export default function StatusBar({ statusMsg, statusOk, activeRepo }) {
  return (
    <div className="status-bar">
      <span className={statusOk ? "status-ok" : "status-err"}>
        ● {statusMsg}
      </span>
      {activeRepo && <span>{activeRepo}</span>}
      <span style={{ marginRight: "auto" }}>Project//Hub</span>
    </div>
  );
}
