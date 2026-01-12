import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeToActivity } from "../services/activityService";

const formatMessage = (entry, t) => {
  const from = entry.from ?? "—";
  const to = entry.to ?? "—";
  const extra = entry.extra ?? "";
  const map = {
    status_changed: `${t ? t("activity.statusChanged") : "Status changed"}: ${from} → ${to}`,
    title_changed: `${t ? t("activity.titleChanged") : "Title changed"}: ${from} → ${to}`,
    description_changed: `${t ? t("activity.descriptionChanged") : "Description changed"}`,
    priority_changed: `${t ? t("activity.priorityChanged") : "Priority changed"}: ${from} → ${to}`,
    deadline_changed: `${t ? t("activity.deadlineChanged") : "Deadline changed"}: ${from} → ${to}`,
    subtask_added: `${t ? t("activity.subtaskAdded") : "Subtask added"}: ${to}`,
    subtask_removed: `${t ? t("activity.subtaskRemoved") : "Subtask removed"}: ${from}`,
    subtask_completed: `${t ? t("activity.subtaskCompleted") : "Subtask completed"}: ${extra || from} → ${to ? "done" : "undone"}`,
    collaborator_added: `${t ? t("activity.collaboratorAdded") : "Collaborator added"}: ${to}`,
    collaborator_removed: `${t ? t("activity.collaboratorRemoved") : "Collaborator removed"}: ${from}`,
    collaborator_role_changed: `${t ? t("activity.collaboratorRoleChanged") : "Collaborator role changed"}: ${from} → ${to} ${extra ? `(${extra})` : ""}`,
    comment_added: `${t ? t("activity.commentAdded") : "Comment added"}`,
    task_created: `${t ? t("activity.taskCreated") : "Task created"}${to?.title ? `: ${to.title}` : ""}`,
    task_deleted: `${t ? t("activity.taskDeleted") : "Task deleted"}`,
  };
  return map[entry.type] || entry.type;
};

const groupByDay = (items) => {
  return items.reduce((acc, item) => {
    const ts = item.createdAt?.toDate?.() || item.createdAt || new Date();
    const key = ts.toLocaleDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

const ActivityDrawer = ({ taskId, taskTitle, onClose, t }) => {
  const [items, setItems] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (!taskId) return undefined;
    const unsub = subscribeToActivity(taskId, (data) => setItems(data || []));
    return () => unsub();
  }, [taskId]);

  const ordered = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return ta - tb;
    });
  }, [items]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [ordered]);

  const grouped = useMemo(() => groupByDay(ordered), [ordered]);
  const dayKeys = Object.keys(grouped);

  return createPortal(
    <div className="activityDrawerOverlay" onClick={onClose}>
      <div
        className="activityDrawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t ? t("activityLog") : "Activity log"}
      >
        <div className="activityHeader">
          <div>
            <div className="activityTitle">{t ? t("activityLog") : "Activity Log"}</div>
            {taskTitle && <div className="activitySubtitle">{taskTitle}</div>}
          </div>
          <button className="activityClose" onClick={onClose} aria-label="Close activity log">
            ×
          </button>
        </div>
        <div className="activityList" ref={listRef}>
          {dayKeys.length === 0 && (
            <div className="activityEmpty">{t ? t("activity.empty") : "No activity yet"}</div>
          )}
          {dayKeys.map((day) => (
            <div key={day} className="activityDay">
              <div className="activityDayLabel">{day}</div>
              <div className="activityItems">
                {grouped[day].map((entry) => {
                  const ts = entry.createdAt?.toDate?.() || entry.createdAt || new Date();
                  const time = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={entry.id} className="activityItem">
                      <div className="activityDot" />
                      <div className="activityContent">
                        <div className="activityMeta">
                          <span className="activityActor">{entry.actorName || "User"}</span>
                          <span className="activityTime">{time}</span>
                        </div>
                        <div className="activityText">{formatMessage(entry, t)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ActivityDrawer;
