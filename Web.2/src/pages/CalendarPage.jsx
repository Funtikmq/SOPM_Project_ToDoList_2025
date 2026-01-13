import { useCalendar } from "../context/CalendarContext";
import { useTranslate } from "../translation";

const CalendarPage = () => {
  const { events, view, setView, moveEvent } = useCalendar();
  const { t } = useTranslate();

  return (
    <div className="pagePlaceholder">
      <div className="pageHeader">
        <h2>{t("menu.calendar")}</h2>
        <div className="pageActions">
          <button className={`pillBtn ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>
            {t("calendar.month")}
          </button>
          <button className={`pillBtn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>
            {t("calendar.week")}
          </button>
        </div>
      </div>
      <p>{t("calendar.eventsAvailable")}: {events.length}</p>
      <div className="calendarList">
        {events.slice(0, 10).map((ev) => (
          <div key={ev.id} className="calendarCard">
            <div className="calendarTitle">{ev.title}</div>
            <div className="calendarMeta">
              <span>{(ev.start && ev.start.toISOString().slice(0, 10)) || "-"}</span>
              <span className={`badge status-${ev.status || "active"}`}>{t(ev.status || "active")}</span>
              {ev.priority && <span className={`badge priority-${ev.priority}`}>{t(ev.priority)}</span>}
            </div>
            <button
              className="pillBtn ghost"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                moveEvent(ev.id, tomorrow);
              }}
            >
              {t("calendar.moveTomorrow")}
            </button>
          </div>
        ))}
        {events.length === 0 && <div>{t("calendar.noDeadlineTasks")}</div>}
      </div>
    </div>
  );
};

export default CalendarPage;
