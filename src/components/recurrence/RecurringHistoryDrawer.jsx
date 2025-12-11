import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "../../components/Task.css";

const typeIcon = {
  generated: "🔁",
  completed: "✔️",
  skipped: "⏭️",
  overdue: "⚠️",
};

const formatDate = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
};

const RecurringHistoryDrawer = ({ taskId, onClose }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!taskId) return () => {};
    const q = query(collection(db, "tasks", taskId, "recurrenceHistory"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
    });
    return () => unsub();
  }, [taskId]);

  if (!taskId) return null;

  const handleOverlay = (e) => {
    if (e.target.classList.contains("recurrenceOverlay")) onClose?.();
  };

  return (
    <div className="recurrenceOverlay" onClick={handleOverlay}>
      <div className="recurrenceDrawer">
        <div className="recurrenceHeader">
          <div>
            <div className="recurrenceTitle">Recurring History</div>
            <div className="recurrenceSubtitle">{taskId}</div>
          </div>
          <button className="recurrenceClose" onClick={onClose} aria-label="Close recurrence history">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="recurrenceEmpty">No recurrence events yet</div>
        ) : (
          <div className="recurrenceList">
            {items.map((item) => (
              <div key={item.id} className="recurrenceItem">
                <div className="recurrenceIcon">{typeIcon[item.type] || "🔁"}</div>
                <div className="recurrenceContent">
                  <div className="recurrenceMeta">
                    <span className="recurrenceType">{item.type}</span>
                    <span className="recurrenceDate">{formatDate(item.date)}</span>
                  </div>
                  <div className="recurrenceText">
                    {item.type === "generated" && `Instance generated${item.deadline ? ` (deadline: ${item.deadline})` : ""}`}
                    {item.type === "completed" && `Completed by ${item.actor || "user"}`}
                    {item.type === "skipped" && "Skipped, next created"}
                    {item.type === "overdue" && "Marked overdue"}
                    {!["generated", "completed", "skipped", "overdue"].includes(item.type) && (item.note || "Event")}
                  </div>
                  {item.nextTaskId && (
                    <button
                      className="recurrenceOpenBtn"
                      onClick={() => window.open(`/task/${item.nextTaskId}`, "_blank")}
                    >
                      Open instance
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringHistoryDrawer;
