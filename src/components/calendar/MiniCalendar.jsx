import { useMemo, useState } from "react";
import "./calendar.css";
import { formatDateKey } from "./useCalendarDrag";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MiniCalendar = ({ initialDate = new Date(), tasksByDate = {}, onSelectDay, t }) => {
  const [referenceDate, setReferenceDate] = useState(initialDate);
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const totalCells = Math.max(35, Math.ceil((startOffset + daysInMonth) / 7) * 7);
    const list = [];
    for (let i = 0; i < totalCells; i += 1) {
      const dayNum = i - startOffset + 1;
      const dateObj = new Date(year, month, dayNum);
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      list.push({ key: formatDateKey(dateObj), dateObj, inMonth });
    }
    return list;
  }, [daysInMonth, month, startOffset, year]);

  return (
    <div className="miniCal card-glass">
      <div className="miniCalHeader">
        <div className="miniCalTitle">{t ? t("calendar.miniCalendar") : "Calendar"}</div>
        <div className="miniCalMonth">
          <button
            type="button"
            className="miniNavBtn"
            onClick={() => {
              const d = new Date(referenceDate);
              d.setMonth(d.getMonth() - 1);
              setReferenceDate(d);
            }}
            aria-label="Previous month"
          >
            ‹
          </button>
          <span>{referenceDate.toLocaleString(undefined, { month: "long", year: "numeric" })}</span>
          <button
            type="button"
            className="miniNavBtn"
            onClick={() => {
              const d = new Date(referenceDate);
              d.setMonth(d.getMonth() + 1);
              setReferenceDate(d);
            }}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>
      <div className="miniCalWeekdays">
        {weekdays.map((d) => (
          <span key={d}>{d[0]}</span>
        ))}
      </div>
      <div className="miniCalGrid">
        {cells.map(({ key, dateObj, inMonth }) => {
          const hasTasks = (tasksByDate[key] || []).length > 0;
          const isToday = key === formatDateKey(new Date());
          return (
            <button
              key={key}
              type="button"
              className={`miniCalCell ${inMonth ? "" : "muted"} ${hasTasks ? "hasTasks" : ""} ${
                isToday ? "today" : ""
              }`}
              onClick={() => onSelectDay?.(key)}
            >
              <span>{dateObj.getDate()}</span>
              {hasTasks && <span className="miniDot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
