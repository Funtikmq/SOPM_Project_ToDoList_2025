import "./Task.css";

const formatWeekdays = (days = []) => {
  const map = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
  return days.map((d) => map[d] || d).join(", ");
};

const RecurrenceBadge = ({ recurring }) => {
  if (!recurring?.isRecurring) return null;

  let text = "Repeating";
  if (recurring.type === "daily") {
    text = "Daily";
  } else if (recurring.type === "weekly") {
    const daysLabel = formatWeekdays(recurring.byWeekday || []);
    text = `Weekly${daysLabel ? `: ${daysLabel}` : ""}`;
  } else if (recurring.type === "monthly") {
    if (recurring.byWeekday?.length) {
      const weekday = formatWeekdays(recurring.byWeekday || []);
      text = `Monthly: ${weekday || "First"}`;
    } else {
      text = `Monthly: ${recurring.byMonthday || 1}`;
    }
  }

  return <span className="recurrenceBadge">{text}</span>;
};

export default RecurrenceBadge;
