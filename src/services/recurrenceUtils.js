// Simple recurrence calculator for daily/weekly/monthly rules.
// Dates are handled in local time; timezone field is stored but not applied here.

const WEEKDAY_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const formatDateYMD = (date) => {
  if (!date || Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const calculateNextDate = (recurring = {}, currentDeadline) => {
  if (!recurring?.isRecurring) return null;
  const base = currentDeadline ? new Date(`${currentDeadline}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return null;

  const interval = Math.max(1, recurring.interval || 1);
  let next;

  if (recurring.type === "daily") {
    next = new Date(base);
    next.setDate(next.getDate() + interval);
  } else if (recurring.type === "weekly") {
    const days = Array.isArray(recurring.byWeekday) && recurring.byWeekday.length ? recurring.byWeekday : ["mon"];
    const dayIndexes = days.map((d) => WEEKDAY_INDEX[d] ?? 1);
    const startIndex = base.getDay();
    let minDiff = Infinity;
    dayIndexes.forEach((idx) => {
      let diff = idx - startIndex;
      if (diff <= 0) diff += 7 * interval;
      if (diff < minDiff) minDiff = diff;
    });
    next = new Date(base);
    next.setDate(next.getDate() + minDiff);
  } else if (recurring.type === "monthly") {
    const targetDay = Math.min(Math.max(1, recurring.byMonthday || base.getDate()), 31);
    next = new Date(base);
    next.setMonth(next.getMonth() + interval);
    const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(targetDay, daysInMonth));
  } else {
    return null;
  }

  const endDate = recurring.endDate ? new Date(`${recurring.endDate}T00:00:00`) : null;
  if (endDate && next.getTime() > endDate.getTime()) return null;

  return formatDateYMD(next);
};

export const recurringLabel = (recurring = {}) => {
  if (!recurring?.isRecurring) return "";
  if (recurring.type === "daily") return "Daily";
  if (recurring.type === "weekly") {
    const d = recurring.byWeekday?.[0] || "mon";
    return `Weekly (${d.charAt(0).toUpperCase() + d.slice(1)})`;
  }
  if (recurring.type === "monthly") return `Monthly (${recurring.byMonthday || 1})`;
  return "";
};
