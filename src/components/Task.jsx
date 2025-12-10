import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Task.css";
import Dropdown from "./ui/Dropdown";
import ShareTaskModal from "./ShareTaskModal";
import { useAuth } from "../context/AuthContext";
import { parseDeadline, useTasks } from "../context/TaskContext";

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
  { value: "canceled", label: "Canceled" },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const isNearDeadline = (dateStr) => {
  const d = parseDeadline(dateStr);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = d.getTime() - today.getTime();
  return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
};

const Task = ({ task: taskProp, taskData, onUpdate, onDelete, onToggleExpand, expanded, t }) => {
  const task = taskProp || taskData;
  const { user } = useAuth();
  const { addSubtask, toggleSubtask, removeSubtask, markAllSubtasksDone } = useTasks();
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = expanded !== undefined ? expanded : localExpanded;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(task?.title || "");
  const [showDateInput, setShowDateInput] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, width: 240 });
  const deadlineButtonRef = useRef(null);
  const datePickerRef = useRef(null);
  const [tempDeadline, setTempDeadline] = useState(task?.deadline || "");
  const [showShare, setShowShare] = useState(false);

  const collaborators = Array.isArray(task?.collaborators) ? task.collaborators : [];
  const ownerId = task?.ownerId || task?.userId;
  const isOwner = user?.uid && ownerId === user.uid;
  const userCollab = collaborators.find((c) => c.uid === user?.uid);
  const role = isOwner ? "owner" : userCollab?.role || "viewer";
  const canEdit = role === "owner" || role === "editor";
  const canDelete = role === "owner";
  const canManageCollaborators = role === "owner";
  const isShared = task?.shared || collaborators.length > 0;

  useEffect(() => {
    setTempTitle(task?.title || "");
    setTempDeadline(task?.deadline || "");
  }, [task]);

  if (!task) return null;

  const progress = useMemo(() => {
    const list = Array.isArray(task.subtasks) ? task.subtasks : [];
    if (!list.length) return { done: 0, total: 0 };
    const done = list.filter((s) => s.done).length;
    return { done, total: list.length };
  }, [task.subtasks]);
  const progressPercent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  const participantBadges = useMemo(() => {
    const list = [];
    const seen = new Set();
    const ownerUsername =
      task.ownerUsername || (isOwner ? user?.username : "") || (task.ownerId ? `user-${task.ownerId.slice(0, 4)}` : "owner");
    const ownerName = task.ownerName || (isOwner ? user?.displayName : "") || ownerUsername;
    if (ownerId && !seen.has(ownerId)) {
      seen.add(ownerId);
      list.push({
        uid: ownerId,
        username: ownerUsername,
        displayName: ownerName,
        role: "owner",
      });
    }
    collaborators.forEach((c) => {
      if (!c.uid || seen.has(c.uid)) return;
      seen.add(c.uid);
      list.push({ ...c, role: c.role || "viewer" });
    });
    return list;
  }, [collaborators, ownerId, isOwner, task.ownerId, task.ownerName, task.ownerUsername, user?.displayName, user?.username]);

  const handleUpdate = (patch) => {
    if (!canEdit) return;
    onUpdate?.(task.id, patch);
  };

  const toggleExpand = () => {
    if (expanded !== undefined) onToggleExpand?.(task.id);
    else setLocalExpanded((prev) => !prev);
  };

  const handleTitleSave = () => {
    if (!canEdit) {
      setIsEditingTitle(false);
      return;
    }
    const clean = tempTitle.trim();
    setIsEditingTitle(false);
    if (clean && clean !== task.title) handleUpdate({ title: clean });
    else setTempTitle(task.title || "");
  };

  const handleAddSubtask = async (title) => {
    if (!canEdit || !task?.id) return;
    const clean = title.trim();
    if (!clean) return;
    await addSubtask(task.id, clean);
  };

  const handleToggleSubtask = async (subtask) => {
    if (!canEdit || !task?.id || !subtask?.id) return;
    await toggleSubtask(task.id, subtask.id, !subtask.done);
  };

  const handleDeleteSubtask = async (sid) => {
    if (!canEdit || !task?.id) return;
    await removeSubtask(task.id, sid);
  };

  const markAllDone = () => {
    if (!canEdit || !task?.id || !task?.subtasks?.length) return;
    markAllSubtasksDone(task.id, task.subtasks);
  };

  const saveDeadline = () => {
    if (!canEdit) return;
    handleUpdate({ deadline: tempDeadline || "" });
    setShowDateInput(false);
  };

  const positionDatePicker = useCallback(() => {
    if (!deadlineButtonRef.current) return;
    const rect = deadlineButtonRef.current.getBoundingClientRect();
    const minWidth = Math.max(rect.width + 16, 240);
    const maxLeft = window.scrollX + window.innerWidth - minWidth - 12;
    const left = Math.min(Math.max(rect.left + window.scrollX, window.scrollX + 12), maxLeft);
    setPickerPosition({
      top: rect.bottom + 10 + window.scrollY,
      left,
      width: minWidth,
    });
  }, []);

  useLayoutEffect(() => {
    if (showDateInput) {
      positionDatePicker();
    }
  }, [positionDatePicker, showDateInput]);

  useEffect(() => {
    if (!showDateInput) return undefined;
    const handleOutside = (e) => {
      if (datePickerRef.current?.contains(e.target)) return;
      if (deadlineButtonRef.current?.contains(e.target)) return;
      setTempDeadline(task.deadline || "");
      setShowDateInput(false);
    };
    const handleReposition = () => positionDatePicker();
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    positionDatePicker();
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [positionDatePicker, showDateInput, task.deadline]);

  return (
    <div className="taskWrapper">
      <div className="task taskRowCard taskRowClickable" data-expanded={isExpanded} onClick={toggleExpand}>
        <div
          className="taskItem statusCell"
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
            disabled={!canEdit}
          />
        </div>

        <div className="taskItem taskTitleCell" onClick={(e) => e.stopPropagation()}>
          <div className="taskTitleRow">
            {!isEditingTitle ? (
              <h3
                className={`taskTitle ${!canEdit ? "readOnly" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canEdit) setIsEditingTitle(true);
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
            {isShared && <span className="sharedIcon" aria-label="Shared task">👥</span>}
          </div>
          <button
            type="button"
            className="shareBadgeRow"
            onClick={(e) => {
              e.stopPropagation();
              setShowShare(true);
            }}
          >
            <div className="shareLabel">
              <span className="shareEmoji">👥</span>
              <span>{collaborators.length} {collaborators.length === 1 ? "collaborator" : "collaborators"}</span>
            </div>
            <div className="avatarStack">
              {participantBadges.slice(0, 4).map((c) => (
                <span key={c.uid} className="collabAvatar" title={`#${c.username} (${c.role})`}>
                  {(c.username || c.displayName || "?")[0]?.toUpperCase()}
                </span>
              ))}
              {participantBadges.length > 4 && (
                <span className="collabAvatar more">+{participantBadges.length - 4}</span>
              )}
            </div>
          </button>
        </div>

        <div
          className="taskItem priorityCell"
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
            disabled={!canEdit}
          />
        </div>

        <div className="taskItem deadlineCell">
          <button
            className={`taskDeadline deadlineChip taskDeadlineBadge ${isNearDeadline(task.deadline) ? "deadlineWarning" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!canEdit) return;
              setShowDateInput((prev) => !prev);
            }}
            disabled={!canEdit}
            ref={deadlineButtonRef}
          >
            {task.deadline ? task.deadline : t ? t("noDeadline") : "No deadline"}
          </button>
          {showDateInput &&
            canEdit &&
            createPortal(
              <div
                className="deadlinePicker"
                style={{
                  top: `${pickerPosition.top}px`,
                  left: `${pickerPosition.left}px`,
                  minWidth: `${pickerPosition.width}px`,
                }}
                ref={datePickerRef}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="date"
                  value={tempDeadline}
                  onChange={(e) => setTempDeadline(e.target.value)}
                  className="taskDateInput glassInput"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setTempDeadline(task.deadline || "");
                      setShowDateInput(false);
                    }
                  }}
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
              </div>,
              document.body
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
                      handleAddSubtask(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  disabled={!canEdit}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const input = e.currentTarget.previousElementSibling;
                    if (input && input.value) {
                      handleAddSubtask(input.value);
                      input.value = "";
                    }
                  }}
                  disabled={!canEdit}
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
                  disabled={!canEdit}
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
                      handleToggleSubtask(s);
                    }}
                    disabled={!canEdit}
                  />
                    <span className={`subtaskText ${s.done ? "done" : ""}`}>{s.title}</span>
                    <button
                      className="subtaskDeleteBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubtask(s.id);
                      }}
                      aria-label="Delete subtask"
                      disabled={!canEdit}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className={`deleteTaskBtn ${!canDelete ? "disabled" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (canDelete) onDelete?.(task.id);
              }}
              disabled={!canDelete}
            >
              {t ? t("deleteTask") : "Delete task"}
            </button>
          </div>
        </div>
      </div>

      <ShareTaskModal
        open={showShare}
        onClose={() => setShowShare(false)}
        taskId={task.id}
        initialTask={task}
        currentUser={user}
        canManage={canManageCollaborators}
      />
    </div>
  );
};

export default Task;
