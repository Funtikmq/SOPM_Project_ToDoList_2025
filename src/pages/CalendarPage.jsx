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
            Month
          </button>
          <button className={`pillBtn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>
            Week
          </button>
        </div>
      </div>
      <p>Evenimente disponibile: {events.length}</p>
      <div className="calendarList">
        {events.slice(0, 10).map((ev) => (
          <div key={ev.id} className="calendarCard">
            <div className="calendarTitle">{ev.title}</div>
            <div className="calendarMeta">
              <span>{(ev.start && ev.start.toISOString().slice(0, 10)) || "-"}</span>
              <span className={`badge status-${ev.status || "active"}`}>{t(`status.${ev.status || "active"}`)}</span>
              {ev.priority && <span className={`badge priority-${ev.priority}`}>{t(`priority.${ev.priority}`)}</span>}
            </div>
            <button
              className="pillBtn ghost"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                moveEvent(ev.id, tomorrow);
              }}
            >
              Mută pe mâine
            </button>
          </div>
        ))}
        {events.length === 0 && <div>Nu există task-uri cu deadline.</div>}
      </div>
    </div>
  );
};

export default CalendarPage;
