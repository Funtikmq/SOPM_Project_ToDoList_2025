import { useEffect, useMemo, useState } from "react";
import "./Task.css";
import Dropdown from "./Dropdown";

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "canceled", label: "Canceled" },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const randomId = () => Math.random().toString(36).slice(2, 9);

const isNearDeadline = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const diff = d.getTime() - today.getTime();
  return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
};

const Task = ({ task: taskProp, taskData, onUpdate, onDelete, onToggleExpand, expanded, t }) => {
  const task = taskProp || taskData;
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = expanded !== undefined ? expanded : localExpanded;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(task?.title || "");
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [showDateInput, setShowDateInput] = useState(false);
  const [tempDeadline, setTempDeadline] = useState(task?.deadline || "");

  useEffect(() => {
    setTempTitle(task?.title || "");
    setSubtasks(task?.subtasks || []);
    setTempDeadline(task?.deadline || "");
  }, [task]);

  if (!task) return null;

  const progress = useMemo(() => {
    if (!subtasks.length) return { done: 0, total: 0 };
    const done = subtasks.filter((s) => s.done).length;
    return { done, total: subtasks.length };
  }, [subtasks]);
  const progressPercent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  const handleUpdate = (patch) => onUpdate?.(task.id, patch);

  const toggleExpand = () => {
    if (expanded !== undefined) onToggleExpand?.(task.id);
    else setLocalExpanded((prev) => !prev);
  };

  const handleRowClick = () => toggleExpand();

  const handleTitleSave = () => {
    const clean = tempTitle.trim();
    setIsEditingTitle(false);
    if (clean && clean !== task.title) handleUpdate({ title: clean });
    else setTempTitle(task.title || "");
  };

  const addSubtask = (title) => {
    const clean = title.trim();
    if (!clean) return;
    const next = [...subtasks, { id: randomId(), title: clean, done: false }];
    setSubtasks(next);
    handleUpdate({ subtasks: next });
  };

  const toggleSubtask = (sid) => {
    const next = subtasks.map((s) => (s.id === sid ? { ...s, done: !s.done } : s));
    setSubtasks(next);
    handleUpdate({ subtasks: next });
  };

  const removeSubtask = (sid) => {
    const next = subtasks.filter((s) => s.id !== sid);
    setSubtasks(next);
    handleUpdate({ subtasks: next });
  };
  const handleDeleteSubtask = (sid) => removeSubtask(sid);

  const markAllDone = () => {
    if (!subtasks.length) return;
    const next = subtasks.map((s) => ({ ...s, done: true }));
    setSubtasks(next);
    handleUpdate({ subtasks: next });
  };

  const saveDeadline = () => {
    handleUpdate({ deadline: tempDeadline || "" });
    setShowDateInput(false);
  };

  return (
    <div className="taskWrapper">
      <div className="task taskRowCard taskRowClickable" data-expanded={isExpanded} onClick={handleRowClick}>
        <div
          className="taskItem"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Dropdown
            value={task.status}
            onChange={(val) => handleUpdate({ status: val })}
            options={STATUS_OPTIONS.map((opt) => ({ ...opt, label: t ? t(opt.value) : opt.label }))}
            placeholder={t ? t("status") : "Status"}
            variant="status"
          />
        </div>

        <div className="taskItem">
          {!isEditingTitle ? (
            <h3
              className="taskTitle"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
            >
              {task.title || (t ? t("noTitle") : "Untitled")}
            </h3>
          ) : (
            <input
              className="taskTitleInput glassInput"
              value={tempTitle}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setTempTitle(task.title || "");
                  setIsEditingTitle(false);
                }
              }}
            />
          )}
        </div>

        <div
          className="taskItem"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Dropdown
            value={task.priority}
            onChange={(val) => handleUpdate({ priority: val })}
            options={PRIORITY_OPTIONS.map((opt) => ({ ...opt, label: t ? t(opt.value) : opt.label }))}
            placeholder={t ? t("priority") : "Priority"}
            variant="priority"
          />
        </div>

        <div className="taskItem">
          <button
            className={`taskDeadline deadlineChip taskDeadlineBadge ${isNearDeadline(task.deadline) ? "deadlineWarning" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDateInput((prev) => !prev);
            }}
          >
            {task.deadline ? task.deadline : t ? t("noDeadline") : "No deadline"}
          </button>
          {showDateInput && (
            <div className="deadlinePicker" onClick={(e) => e.stopPropagation()}>
              <input
                type="date"
                value={tempDeadline}
                onChange={(e) => setTempDeadline(e.target.value)}
                className="taskDateInput glassInput"
              />
              <div className="deadlinePickerActions">
                <button type="button" className="deadlineSave" onClick={saveDeadline}>
                  {t ? t("save") : "Save"}
                </button>
                <button
                  type="button"
                  className="deadlineCancel"
                  onClick={() => {
                    setTempDeadline(task.deadline || "");
                    setShowDateInput(false);
                  }}
                >
                  {t ? t("cancel") : "Cancel"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`subtasksWrapper ${isExpanded ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="taskExpand open">
          <div className="subtaskSection subtasksContainer">
            <div className="subtaskHeader">
              <div className="subtaskTitle">
                {t ? t("subtasks") : "Subtasks"}{" "}
                <span className="subtaskProgress">
                  {(t ? t("progress") : "Progress")}: {progress.done}/{progress.total}
                </span>
              </div>
              <div className="subtaskAdd">
                <input
                  type="text"
                  placeholder={t ? t("subtaskPlaceholder") : "Subtask name"}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addSubtask(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const input = e.currentTarget.previousElementSibling;
                    if (input && input.value) {
                      addSubtask(input.value);
                      input.value = "";
                    }
                  }}
                >
                  {t ? t("addSubtask") : "Add subtask"}
                </button>
                <button
                  type="button"
                  className="markAll"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllDone();
                  }}
                >
                  {t ? t("markAllDone") : "Mark all done"}
                </button>
              </div>
            </div>
            <div className="subtaskProgressBar">
              <div className="subtaskProgressFill" style={{ width: `${progressPercent}%` }} />
            </div>

            {subtasks.length === 0 ? (
              <div className="subtaskEmpty">{t ? t("noTasks") : "No subtasks yet"}</div>
            ) : (
              <div className="subtaskList">
                {subtasks.map((s) => (
                  <div key={s.id} className="subtaskRow">
                    <input
                      type="checkbox"
                      checked={!!s.done}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSubtask(s.id);
                      }}
                    />
                    <span className={`subtaskText ${s.done ? "done" : ""}`}>{s.title}</span>
                    <button
                      className="subtaskDeleteBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubtask(s.id);
                      }}
                      aria-label="Delete subtask"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className="deleteTaskBtn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id);
              }}
            >
              {t ? t("deleteTask") : "Delete task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;





