import { useMemo } from "react";
import CalendarTaskCard from "./CalendarTaskCard";
import useCalendarDrag, { formatDateKey } from "./useCalendarDrag";
import "./calendar.css";

const weekdays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const buildMonthDays = (currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = startOffset;
  const totalCells = Math.max(35, Math.ceil((prevDays + daysInMonth) / 7) * 7);
  const cells = [];
  for (let i = 0; i < totalCells; i += 1) {
    const dayNum = i - prevDays + 1;
    const dateObj = new Date(year, month, dayNum);
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    cells.push({ dateObj, inMonth, key: formatDateKey(dateObj) });
  }
  return cells;
};

const buildWeekDays = (currentDate) => {
  const day = currentDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(currentDate);
  start.setDate(currentDate.getDate() + mondayOffset);
  return Array.from({ length: 7 }).map((_, idx) => {
    const dateObj = new Date(start);
    dateObj.setDate(start.getDate() + idx);
    return { dateObj, inMonth: true, key: formatDateKey(dateObj) };
  });
};

const CalendarGrid = ({ currentDate, view = "month", tasksByDate = {}, onDropTask, onOpenTask, t }) => {
  const { handleDragStart, handleDragOver, handleDrop, draggingId } = useCalendarDrag({
    onDrop: onDropTask,
  });

  const cells = useMemo(
    () => (view === "week" ? buildWeekDays(currentDate) : buildMonthDays(currentDate)),
    [currentDate, view]
  );

  return (
    <div className={`cal-grid ${view}`}>
      <div className="cal-weekdays">
        {weekdays.map((d) => (
          <div key={d} className="cal-weekday">
            {t ? t(d) : d.toUpperCase()}
          </div>
        ))}
      </div>
      <div className="cal-cells">
        {cells.map(({ key, dateObj, inMonth }) => {
          const dayTasks = tasksByDate[key] || [];
          const isToday = key === formatDateKey(new Date());
          return (
            <div
              key={key}
              className={`cal-cell ${inMonth ? "" : "muted"} ${isToday ? "today" : ""}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop(key)}
            >
              <div className="cal-cell-header">
                <span>{dateObj.getDate()}</span>
              </div>
              <div className="cal-cell-body">
                {dayTasks.length === 0 && view === "week" && (
                  <div className="cal-empty">{t ? t("calendar.noTasks") : "No tasks"}</div>
                )}
                {dayTasks.map((task) => (
                  <CalendarTaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onClick={() => onOpenTask?.(task.id)}
                    dragging={draggingId === task.id}
                    t={t}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
