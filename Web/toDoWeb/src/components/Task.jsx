// Task.jsx
import { useState, useRef, useEffect } from "react";
import "./Task.css";

const Task = ({ taskData, onDelete, onUpdate }) => {
  const [expandDelete, setExpandDelete] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [showModifyButton, setShowModifyButton] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);

  const [status, setStatus] = useState(taskData.status);
  const [priority, setPriority] = useState(taskData.priority);
  const [deadline, setDeadline] = useState(taskData.deadline);
  const [tempDeadline, setTempDeadline] = useState(taskData.deadline);

  const wrapperRef = useRef(null);
  const statusRef = useRef(null);
  const priorityRef = useRef(null);
  const deadlineRef = useRef(null);

  // Click outside handler pentru selectori (nu expandDelete)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusSelector(false);
      }

      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPrioritySelector(false);
      }

      if (deadlineRef.current && !deadlineRef.current.contains(event.target)) {
        setShowModifyButton(false);
        setShowDateInput(false);
      }

      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setExpandDelete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Închide toate celelalte selectori când deschidem unul
  const closeAllSelectors = () => {
    setShowStatusSelector(false);
    setShowPrioritySelector(false);
    setShowModifyButton(false);
    setShowDateInput(false);
  };

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

  // Capitalize first letter pentru display
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="taskWrapper" ref={wrapperRef}>
      <div className="task" onClick={handleTaskClick}>
        {/* STATUS */}
        <div className="taskItem" ref={statusRef}>
          <h3
            className={`taskBadge taskStatus taskStatus-${status}`}
            onClick={(e) => {
              e.stopPropagation();
              const wasOpen = showStatusSelector;
              closeAllSelectors();
              setShowStatusSelector(!wasOpen);
            }}
          >
            {capitalize(status)}
          </h3>
          <div
            className={`selectorWrapper ${showStatusSelector ? "open" : ""}`}
          >
            <select
              className="taskSelect"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                onUpdate(taskData.id, { status: e.target.value });
                setShowStatusSelector(false);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="canceled">Canceled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* TITLE */}
        <div className="taskItem">
          <h3 className="taskTitle">{taskData.title}</h3>
        </div>

        {/* PRIORITY */}
        <div className="taskItem" ref={priorityRef}>
          <h3
            className={`taskBadge taskPriority taskPriority-${priority}`}
            onClick={(e) => {
              e.stopPropagation();
              const wasOpen = showPrioritySelector;
              closeAllSelectors();
              setShowPrioritySelector(!wasOpen);
            }}
          >
            {capitalize(priority)}
          </h3>
          <div
            className={`selectorWrapper ${showPrioritySelector ? "open" : ""}`}
          >
            <select
              className="taskSelect"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                onUpdate(taskData.id, { priority: e.target.value });
                setShowPrioritySelector(false);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* DEADLINE */}
        <div className="taskItem" ref={deadlineRef}>
          <h3
            className="taskDeadline"
            onClick={(e) => {
              e.stopPropagation();
              const wasOpen = showModifyButton;
              closeAllSelectors();
              setShowModifyButton(!wasOpen);
              if (!wasOpen) {
                setTempDeadline(deadline);
              }
            }}
          >
            {deadline}
          </h3>
          <div className={`modifyWrapper ${showModifyButton ? "open" : ""}`}>
            <button
              className="taskModifyButton"
              onClick={(e) => {
                e.stopPropagation();
                setShowDateInput((prev) => !prev);
                if (showDateInput) {
                  setDeadline(tempDeadline);
                  onUpdate(taskData.id, { deadline: tempDeadline });
                }
              }}
            >
              Modify
            </button>
          </div>

          <div className={`modifyWrapper ${showDateInput ? "open" : ""}`}>
            <input
              type="date"
              className="taskDateInput"
              value={tempDeadline}
              onChange={(e) => setTempDeadline(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      {/* EXPAND DELETE */}

      <div className={`taskExpand ${expandDelete ? "open" : ""}`}>
        {taskData.description && (
          <p className="taskDescription">
            <strong>Descriere:</strong> {taskData.description}
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
