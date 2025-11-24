import { useState, useRef, useEffect } from "react";
import "./Task.css";
import { useTranslate } from "../translation";

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

  const wrapperRef = useRef(null);
  const deadlineRef = useRef(null);

  // Funcție pentru formatarea datei din YYYY-MM-DD în DD/MM/YYYY
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

  // click outside (doar pentru delete + deadline)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setExpandDelete(false);
      }

      if (deadlineRef.current && !deadlineRef.current.contains(event.target)) {
        setShowModifyButton(false);
        setShowDateInput(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // toggle expand doar daca clickul nu vine de pe select/input/button
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
    <div className="taskWrapper" ref={wrapperRef}>
      <div className="task" onClick={handleTaskClick}>
        {/* STATUS */}
        <div className="taskItem">
          <select
            className={`taskSelectBadge taskStatus-${status}`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              onUpdate(taskData.id, { status: e.target.value });
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="upcoming">{t("upcoming")}</option>
            <option value="active">{t("active")}</option>
            <option value="completed">{t("completed")}</option>
            <option value="overdue">{t("overdue")}</option>
            <option value="canceled">{t("canceled")}</option>
          </select>
        </div>

        {/* TITLE */}
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
        {/* PRIORITY */}
        <div className="taskItem">
          <select
            className={`taskSelectBadge taskPriority-${priority}`}
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              onUpdate(taskData.id, { priority: e.target.value });
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="high">{t("high")}</option>
            <option value="medium">{t("medium")}</option>
            <option value="low">{t("low")}</option>
          </select>
        </div>

        {/* DEADLINE */}
        <div className="taskItem" ref={deadlineRef}>
          <h3
            className={`taskDeadline ${
              isUrgent(deadline) ? "deadlineUrgent" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (showModifyButton) {
                setClosingModify(true);
                setTimeout(() => {
                  setShowModifyButton(false);
                  setClosingModify(false);
                }, 500);
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
                    }, 500);
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
            <div
              className={`modifyWrapper ${closingDateInput ? "closing" : ""}`}
            >
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

      {/* EXPAND DELETE – se deschide doar la click pe task */}
      <div className={`taskExpand ${expandDelete ? "open" : ""}`}>
        {taskData.description && (
          <p className="taskDescription">
            <strong>{t("descriptionLabel")}</strong> {taskData.description}
          </p>
        )}

        <div className="taskExpandButtons">
          <button className="deleteBtn" onClick={() => onDelete(taskData.id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 32 32"
            >
              <path
                fill="currentColor"
                d="M15 4c-.523 0-1.059.184-1.438.563C13.184 4.94 13 5.476 13 6v1H7v2h1v16c0 1.645 1.355 3 3 3h12c1.645 0 3-1.355 3-3V9h1V7h-6V6c0-.523-.184-1.059-.563-1.438C20.06 4.184 19.523 4 19 4zm0 2h4v1h-4zm-5 3h14v16c0 .555-.445 1-1 1H11c-.555 0-1-.445-1-1zm2 3v11h2V12zm4 0v11h2V12zm4 0v11h2V12z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Task;
