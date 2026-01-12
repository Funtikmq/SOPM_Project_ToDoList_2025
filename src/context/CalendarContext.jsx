import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useTasks } from "./TaskContext";

const CalendarContext = createContext({
  events: [],
  view: "month",
  selectedDate: null,
  setView: () => {},
  setSelectedDate: () => {},
  moveEvent: async () => {},
});

const normalizeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const CalendarProvider = ({ children }) => {
  const { tasks, batchUpdateDates } = useTasks();
  const [view, setView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(null);

  const events = useMemo(() => {
    return tasks
      .map((t) => {
        const start = normalizeDate(t.dueDate || t.deadline);
        if (!start) return null;
        return {
          id: t.id,
          title: t.title || "Untitled",
          start,
          status: t.status,
          priority: t.priority,
          tags: t.tags || [],
        };
      })
      .filter(Boolean);
  }, [tasks]);

  const moveEvent = useCallback(
    async (taskId, newDate) => {
      const iso = newDate instanceof Date ? newDate.toISOString().slice(0, 10) : newDate;
      await batchUpdateDates([{ id: taskId, deadline: iso, dueDate: iso }]);
    },
    [batchUpdateDates]
  );

  const value = useMemo(
    () => ({
      events,
      view,
      selectedDate,
      setView,
      setSelectedDate,
      moveEvent,
    }),
    [events, view, selectedDate, moveEvent]
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};

export const useCalendar = () => useContext(CalendarContext);
