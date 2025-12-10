import "./calendar.css";

const priorityColor = {
  high: "#e85b6b",
  medium: "#f3a54d",
  low: "#55c28a",
};

const CalendarTaskCard = ({ task, onDragStart, onClick }) => {
  const color = priorityColor[task.priority] || "#b47bff";
  return (
    <div
      className="cal-task-card"
      draggable
      onDragStart={onDragStart(task)}
      onClick={onClick}
      style={{ borderColor: `${color}55`, boxShadow: `0 8px 16px ${color}26` }}
      title={task.title}
    >
      <div className="cal-task-title">{task.title || "Untitled"}</div>
      <div className="cal-task-meta">
        <span className="cal-priority-chip" style={{ background: color }}>
          {task.priority || "medium"}
        </span>
        {task.collaborators?.length ? (
          <span className="cal-collab-count">{task.collaborators.length}</span>
        ) : null}
      </div>
    </div>
  );
};

export default CalendarTaskCard;
