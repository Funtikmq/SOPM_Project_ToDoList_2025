import { useMemo, useState } from "react";
import CalendarGrid from "../components/calendar/CalendarGrid";
import { useTasks } from "../context/TaskContext";
import { useTranslate } from "../translation";
import "./CalendarPage.css";

const Calendar = () => {
  const { tasks, tasksByDate, updateTask } = useTasks();
  const { t } = useTranslate();
  const [view, setView] = useState("month"); // month | week
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthLabel = useMemo(
    () => currentDate.toLocaleString(undefined, { month: "long", year: "numeric" }),
    [currentDate]
  );

  const goMonth = (delta) => {
    const next = new Date(currentDate);
    if (view === "week") {
      next.setDate(currentDate.getDate() + delta * 7);
    } else {
      next.setMonth(currentDate.getMonth() + delta);
    }
    setCurrentDate(next);
  };

  const goToday = () => setCurrentDate(new Date());

  const handleDropTask = async (taskId, dateKey) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.deadline === dateKey) return;
    await updateTask(taskId, { deadline: dateKey });
  };

  const handleOpenTask = (taskId) => {
    // placeholder: could integrate existing drawer/viewer
    console.info("Open task", taskId);
  };

  return (
    <div className="calendarPage">
      <main className="calendarMain">
        <div className="calendarTopBar glass-surface">
          <div className="calNav">
            <button type="button" className="ghostBtn" onClick={() => goMonth(-1)}>
              ‹
            </button>
            <div className="calMonthLabel">{monthLabel}</div>
            <button type="button" className="ghostBtn" onClick={() => goMonth(1)}>
              ›
            </button>
            <button type="button" className="pillBtn" onClick={goToday}>
              {t ? t("calendar.today") : "Today"}
            </button>
          </div>
          <div className="calActions">
            <button
              type="button"
              className={`pillBtn ${view === "month" ? "active" : ""}`}
              onClick={() => setView("month")}
            >
              {t ? t("calendar.month") : "Month"}
            </button>
            <button
              type="button"
              className={`pillBtn ${view === "week" ? "active" : ""}`}
              onClick={() => setView("week")}
            >
              {t ? t("calendar.week") : "Week"}
            </button>
          </div>
        </div>

        <div className="calendarGridCard glass-surface">
          <CalendarGrid
            currentDate={currentDate}
            view={view}
            tasksByDate={tasksByDate}
            onDropTask={handleDropTask}
            onOpenTask={handleOpenTask}
            t={t}
          />
          <div className="calendarHint">{t ? t("calendar.dragToReschedule") : "Drag to reschedule"}</div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
