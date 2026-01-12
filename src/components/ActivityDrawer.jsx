import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useActivity } from "../context/ActivityContext";
import { useTranslate } from "../translation";
import "./ActivityDrawer.css";

const formatTime = (ts) => {
  if (!ts) return "-";
  if (typeof ts.toDate === "function") {
    return ts.toDate().toLocaleString();
  }
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

const typeLabels = (t) => ({
  task_created: t("activity.created") || "Task created",
  task_updated: t("activity.updated") || "Task updated",
  status_changed: t("activity.statusChanged") || "Status changed",
  deadline_changed: t("activity.deadlineChanged") || "Deadline changed",
  tag_added: t("activity.tagAdded") || "Tag added",
  attachment_added: t("activity.attachmentAdded") || "Attachment added",
  comment_added: t("activity.commentAdded") || "Comment added",
});

const ActivityDrawer = ({ taskId, open, onClose }) => {
  const { subscribeTaskActivity, getActivity } = useActivity();
  const { t } = useTranslate();
  const activity = getActivity(taskId);
  const labels = useMemo(() => typeLabels(t), [t]);

  useEffect(() => {
    if (!open || !taskId) return undefined;
    const unsub = subscribeTaskActivity(taskId, 100);
    return () => unsub?.();
  }, [open, taskId, subscribeTaskActivity]);

  if (!open) return null;

  return createPortal(
    <div className="activityOverlay" onClick={onClose}>
      <div className="activityDrawer" onClick={(e) => e.stopPropagation()}>
        <div className="activityHeader">
          <div className="activityTitle">{t("activity.title") || "Activity"}</div>
          <button className="iconButton" onClick={onClose} aria-label={t("common.close") || "Close"}>
            ×
          </button>
        </div>
        <div className="activityBody">
          {activity.length === 0 ? (
            <div className="activityEmpty">{t("activity.empty") || "No activity yet."}</div>
          ) : (
            <ul className="activityList">
              {activity.map((entry) => (
                <li key={entry.id} className="activityItem">
                  <div className="activityRow">
                    <div className="activityType">{labels[entry.type] || entry.type}</div>
                    <div className="activityTime">{formatTime(entry.createdAt)}</div>
                  </div>
                  <div className="activityMeta">
                    {entry.byName || entry.byUid ? (
                      <span className="activityActor">{entry.byName || entry.byUid}</span>
                    ) : null}
                    {entry.payload?.field && (
                      <span className="activityField">Field: {entry.payload.field}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ActivityDrawer;
