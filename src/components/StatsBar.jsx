import { useTasks } from "../context/TaskContext";
import { useTranslate } from "../translation";
import MiniCalendar from "./calendar/MiniCalendar";
import "./StatsBar.css";

const StatsBar = ({ compact = false, hideMini = false }) => {
  const { stats, tasksByDate } = useTasks();
  const { t, lang } = useTranslate();

  return (
    <div className={`statsBar glass-surface ${compact ? "statsBarCompact" : ""}`}>
      <div className="statRow">
        <StatCard label={t("Total")} value={stats.total} icon="list" />
        <StatCard label={t("Active")} value={stats.active} accent icon="bolt" />
        <StatCard label={t("Completed")} value={stats.completed} icon="check" />
        <StatCard label={t("Overdue")} value={stats.overdue} danger icon="alarm" />
      </div>
      {!hideMini && (
        <div className="statCard miniCalCard">
          <MiniCalendar tasksByDate={tasksByDate} t={t} lang={lang} />
        </div>
      )}
    </div>
  );
};

const iconMap = {
  list: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <path fill="currentColor" d="M9 18v-2h11v2zm-6-1q-.425 0-.712-.288T2 16t.288-.712T3 15t.713.288T4 16t-.288.713T3 17m6-4v-2h11v2zm-6-1q-.425 0-.712-.288T2 11t.288-.712T3 10t.713.288T4 11t-.288.713T3 12m6-4V6h11v2zm-6-1q-.425 0-.712-.288T2 6t.288-.712T3 5t.713.288T4 6t-.288.713T3 7" />
    </svg>
  ),
  bolt: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <path fill="currentColor" d="M11 21v-7H6l7-11v7h5z" />
    </svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <path fill="currentColor" d="m10 15.5l-3.5-3.5l1.4-1.4l2.1 2.1l4.6-4.6l1.4 1.4z" />
    </svg>
  ),
  alarm: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137t-2.137-3.175T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137t2.137 3.175T22 12t-.788 3.9t-2.137 3.175t-3.175 2.137T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-7.5l3.5 2.1l.8-1.3l-2.8-1.65V7h-1.5zM5.25 6.5l-2.1-2.1l1.4-1.45l2.1 2.1zm13.5 0l-1.4-1.45l2.1-2.1l1.4 1.45z" />
    </svg>
  ),
};

const StatCard = ({ label, value, accent, danger, icon }) => (
  <div className={`statCard ${accent ? "accent" : ""} ${danger ? "danger" : ""}`}>
    <div className="statTop">
      <div className="statLabel">{label}</div>
      <div className="statIcon">{iconMap[icon]}</div>
    </div>
    <div className="statValue">{value}</div>
  </div>
);

export default StatsBar;
