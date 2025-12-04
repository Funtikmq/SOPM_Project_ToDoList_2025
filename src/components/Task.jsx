import { useState, useRef, useEffect } from "react";
import "./Task.css";
import { useTranslate } from "../translation";
import Dropdown from "./Dropdown";

const Task = ({ taskData, onDelete, onUpdate }) => {
  const [expandDelete, setExpandDelete] = useState(false);
  const [showModifyButton, setShowModifyButton] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [closingModify, setClosingModify] = useState(false);
  const [closingDateInput, setClosingDateInput] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(taskData.title);

  const [status, setStatus] = useState(taskData.status);
  const [priority, setPriority] = useState(taskData.priority);
  const [deadline, setDeadline] = useState(taskData.deadline);
  const [tempDeadline, setTempDeadline] = useState(taskData.deadline);
  const { t } = useTranslate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [subtasks, setSubtasks] = useState(taskData.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");

  const wrapperRef = useRef(null);
  const deadlineRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const isUrgent = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return date <= tomorrow;
  };

  const toggleSubtask = (sid) => {
    const updated = subtasks.map((s) =>
      s.id === sid ? { ...s, done: !s.done } : s
    );
    setSubtasks(updated);
    onUpdate(taskData.id, { subtasks: updated });
  };

  const removeSubtask = (sid) => {
    const updated = subtasks.filter((s) => s.id !== sid);
    setSubtasks(updated);
    onUpdate(taskData.id, { subtasks: updated });
  };

  const addSubtask = () => {
    const title = newSubtask.trim();
    if (!title) return;
    const fresh = { id: Date.now().toString(), title, done: false };
    const updated = [...subtasks, fresh];
    setSubtasks(updated);
    onUpdate(taskData.id, { subtasks: updated });
    setNewSubtask("");
  };

  const subtaskProgress = () => {
    if (!subtasks.length) return "0/0";
    const done = subtasks.filter((s) => s.done).length;
    return `${done}/${subtasks.length}`;
  };

  const markAllDone = () => {
    if (!subtasks.length) return;
    const updated = subtasks.map((s) => ({ ...s, done: true }));
    setSubtasks(updated);
    onUpdate(taskData.id, { subtasks: updated });
  };

  const progressRatio = subtasks.length
    ? subtasks.filter((s) => s.done).length / subtasks.length
    : 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setExpandDelete(false);
      }
      if (deadlineRef.current && !deadlineRef.current.contains(event.target)) {
        setShowModifyButton(false);
        setShowDateInput(false);
      }
      setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setStatus(taskData.status);
    setPriority(taskData.priority);
    setDeadline(taskData.deadline);
    setTempDeadline(taskData.deadline);
    setTempTitle(taskData.title);
    setSubtasks(taskData.subtasks || []);
  }, [taskData]);

  const handleTaskClick = (e) => {
    if (
      e.target.tagName !== "SELECT" &&
      e.target.tagName !== "OPTION" &&
      e.target.tagName !== "INPUT" &&
      e.target.tagName !== "BUTTON"
    ) {
      setExpandDelete((prev) => !prev);
    }
  };

  return (
    <div className={`taskWrapper ${openDropdown ? "dropdown-open" : ""}`} ref={wrapperRef}>
      <div className={`task ${openDropdown ? "task-open" : ""}`} onClick={handleTaskClick}>
        {subtasks.length > 0 && (
          <div className="subtaskProgressBar">
            <div className="subtaskProgressFill" style={{ width: `${Math.round(progressRatio * 100)}%` }} />
          </div>
        )}
        <div className="taskItem">
          <Dropdown
            value={status}
            onChange={(val) => {
              setStatus(val);
              onUpdate(taskData.id, { status: val });
            }}
            badgeClass={`statusBadge status-${status}`}
            open={openDropdown === "status"}
            onOpenChange={(next) => setOpenDropdown(next ? "status" : null)}
            options={[
              { value: "upcoming", label: t("upcoming") },
              { value: "active", label: t("active") },
              { value: "completed", label: t("completed") },
              { value: "overdue", label: t("overdue") },
              { value: "canceled", label: t("canceled") },
            ]}
            placeholder={t("status")}
          />
        </div>

        <div className="taskItem" onClick={(e) => e.stopPropagation()}>
          {!isEditingTitle ? (
            <h3
              className="taskTitle"
              onClick={() => {
                setTempTitle(taskData.title);
                setIsEditingTitle(true);
              }}
            >
              {taskData.title}
            </h3>
          ) : (
            <input
              className="taskTitleInput"
              type="text"
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => {
                setIsEditingTitle(false);
                if (tempTitle.trim() !== taskData.title) {
                  onUpdate(taskData.id, { title: tempTitle.trim() });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingTitle(false);
                  if (tempTitle.trim() !== taskData.title) {
                    onUpdate(taskData.id, { title: tempTitle.trim() });
                  }
                }
                if (e.key === "Escape") {
                  setIsEditingTitle(false);
                  setTempTitle(taskData.title);
                }
              }}
            />
          )}
        </div>

        <div className="taskItem">
          <Dropdown
            value={priority}
            onChange={(val) => {
              setPriority(val);
              onUpdate(taskData.id, { priority: val });
            }}
            className={`priorityBadge priority-${priority}`}
            badgeClass={`priorityBadge priority-${priority}`}
            open={openDropdown === "priority"}
            onOpenChange={(next) => setOpenDropdown(next ? "priority" : null)}
            options={[
              { value: "high", label: t("high") },
              { value: "medium", label: t("medium") },
              { value: "low", label: t("low") },
            ]}
            placeholder={t("priority")}
          />
        </div>

        <div className="taskItem" ref={deadlineRef}>
          <h3
            className={`taskDeadline ${isUrgent(deadline) ? "deadlineUrgent" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (showModifyButton) {
                setClosingModify(true);
                setTimeout(() => {
                  setShowModifyButton(false);
                  setClosingModify(false);
                }, 300);
              } else {
                setShowModifyButton(true);
                setTempDeadline(deadline);
              }
            }}
          >
            {formatDate(deadline)}
          </h3>

          {showModifyButton && (
            <div className={`modifyWrapper ${closingModify ? "closing" : ""}`}>
              <button
                className="taskModifyButton"
                onClick={(e) => {
                  e.stopPropagation();
                  if (showDateInput) {
                    setClosingDateInput(true);
                    setTimeout(() => {
                      setShowDateInput(false);
                      setClosingDateInput(false);
                      setDeadline(tempDeadline);
                      onUpdate(taskData.id, { deadline: tempDeadline });
                    }, 300);
                  } else {
                    setShowDateInput(true);
                  }
                }}
              >
                {t("modify")}
              </button>
            </div>
          )}

          {showDateInput && (
            <div className={`modifyWrapper ${closingDateInput ? "closing" : ""}`}>
              <input
                type="date"
                className="taskDateInput"
                value={tempDeadline}
                onChange={(e) => setTempDeadline(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      </div>

      <div className={`taskExpand ${expandDelete ? "open" : ""}`}>
        {taskData.description && (
          <p className="taskDescription">
            <strong>{t("descriptionLabel")}</strong> {taskData.description}
          </p>
        )}

        <div className="subtaskSection">
          <div className="subtaskHeader">
            <div className="subtaskTitle">
              {t("subtasks")} <span className="subtaskProgress">{t("progress")}: {subtaskProgress()}</span>
            </div>
            <div className="subtaskAdd">
              <input
                type="text"
                value={newSubtask}
                placeholder={t("subtaskPlaceholder")}
                onChange={(e) => setNewSubtask(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addSubtask();
                  }
                }}
              />
              <button type="button" onClick={(e) => { e.stopPropagation(); addSubtask(); }}>
                {t("addSubtask")}
              </button>
              {subtasks.length > 0 && (
                <button
                  type="button"
                  className="markAll"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllDone();
                  }}
                >
                  {t("markAllDone")}
                </button>
              )}
            </div>
          </div>
          {subtasks.length === 0 ? (
            <div className="subtaskEmpty">{t("noTasks")}</div>
          ) : (
            <ul className="subtaskList">
              {subtasks.map((s) => (
                <li key={s.id} className="subtaskItem">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!s.done}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSubtask(s.id);
                      }}
                    />
                    <span className={s.done ? "done" : ""}>{s.title}</span>
                  </label>
                  <button
                    className="subtaskDelete"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSubtask(s.id);
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="taskExpandButtons">
          <button className="deleteBtn" onClick={() => onDelete(taskData.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9 17q-.425 0-.712-.288T8 16t.288-.712T9 15h6q.425 0 .713.288T16 16t-.288.713T15 17zm-1-4q-.425 0-.712-.288T7 12t.288-.712T8 11h8q.425 0 .713.288T17 12t-.288.713T16 13zm-1-4q-.425 0-.712-.288T6 8t.288-.712T7 7h10q.425 0 .713.288T18 8t-.288.713T17 9z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Task;
