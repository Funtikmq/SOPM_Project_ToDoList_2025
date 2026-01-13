import { useState } from "react";
import { useTranslate } from "../translation";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import "./AddTask.css";
import Dropdown from "./ui/Dropdown";
import { calculateNextDate } from "../services/recurrenceUtils";

const AddTask = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [interval, setInterval] = useState(1);
  const [weekday, setWeekday] = useState("mon");
  const [monthday, setMonthday] = useState(1);
  const [endDate, setEndDate] = useState("");
  const [autoCreateWindow, setAutoCreateWindow] = useState(7);
  const { t } = useTranslate();
  const { addTask } = useTasks();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in first.");
      return;
    }

    if (title.trim() === "" || deadline.trim() === "") {
      alert(t("fillRequired"));
      return;
    }

    try {
      const recurring =
        recurrenceType === "none"
          ? { isRecurring: false }
          : {
              isRecurring: true,
              type: recurrenceType,
              interval: Number(interval) || 1,
              byWeekday: recurrenceType === "weekly" ? [weekday] : [],
              byMonthday: recurrenceType === "monthly" ? Number(monthday) || 1 : null,
              endDate: endDate || null,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              anchorTaskId: "",
              autoCreateWindow: Number(autoCreateWindow) || 7,
            };

      const taskId = await addTask({
        title,
        description: desc,
        priority,
        deadline,
        recurring,
      });
      if (!taskId) return;
      alert(t("taskSaved"));

      setTitle("");
      setDesc("");
      setPriority("medium");
      setDeadline("");
      setRecurrenceType("none");
      setInterval(1);
      setWeekday("mon");
      setMonthday(1);
      setEndDate("");
      setAutoCreateWindow(7);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const nextPreview =
    recurrenceType !== "none"
      ? calculateNextDate(
          {
            isRecurring: true,
            type: recurrenceType,
            interval: Number(interval) || 1,
            byWeekday: recurrenceType === "weekly" ? [weekday] : [],
            byMonthday: recurrenceType === "monthly" ? Number(monthday) || 1 : null,
            endDate: endDate || null,
          },
          deadline
        )
      : null;

  return (
    <div className="taskFormContainer">
      <div className="taskFormHeader">
        <h3 className="containerTitle">{t("addTask")}</h3>
        {onClose && (
          <button
            type="button"
            className="addTaskClose"
            onClick={onClose}
            aria-label={t("common.close") || "Close"}
          >
            X
          </button>
        )}
      </div>

      <form className="taskForm" onSubmit={handleSubmit}>
        <div className="formRow">
          <h5 className="formLabel">{t("title")}</h5>
        </div>
        <input
          type="text"
          className="taskInput"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <h5>{t("description")}</h5>
        <textarea
          className="taskInput taskText"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        ></textarea>

        <h5>{t("priority")}</h5>
        <Dropdown
          value={priority}
          color="priority"
          options={[
            { value: "high", label: t("high") },
            { value: "medium", label: t("medium") },
            { value: "low", label: t("low") },
          ]}
          onChange={(v) => setPriority(v)}
        />
        <h5>{t("deadline")}</h5>
        <input
          type="date"
          className="taskInput"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        <h5>{t("recurrence") || "Recurrence"}</h5>
        <div className="recurrenceRow">
          <select
            className="taskInput recurrenceSelect"
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
          >
            <option value="none">{t("none") || "None"}</option>
            <option value="daily">{t("daily") || "Daily"}</option>
            <option value="weekly">{t("weekly") || "Weekly"}</option>
            <option value="monthly">{t("monthly") || "Monthly"}</option>
          </select>
          {recurrenceType !== "none" && (
            <input
              type="number"
              min="1"
              className="taskInput recurrenceSmall"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              placeholder={t ? t("interval") : "Interval"}
            />
          )}
          {recurrenceType === "weekly" && (
            <select
              className="taskInput recurrenceSmall"
              value={weekday}
              onChange={(e) => setWeekday(e.target.value)}
            >
              <option value="mon">Mon</option>
              <option value="tue">Tue</option>
              <option value="wed">Wed</option>
              <option value="thu">Thu</option>
              <option value="fri">Fri</option>
              <option value="sat">Sat</option>
              <option value="sun">Sun</option>
            </select>
          )}
          {recurrenceType === "monthly" && (
            <input
              type="number"
              min="1"
              max="31"
              className="taskInput recurrenceSmall"
              value={monthday}
              onChange={(e) => setMonthday(e.target.value)}
              placeholder={t ? t("day") : "Day"}
            />
          )}
        </div>
        {recurrenceType !== "none" && (
          <div className="recurrenceMeta">
            <input
              type="date"
              className="taskInput"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder={t("endDate") || "End date (optional)"}
            />
            <input
              type="number"
              min="1"
              className="taskInput"
              value={autoCreateWindow}
              onChange={(e) => setAutoCreateWindow(e.target.value)}
              placeholder="Auto-create window (days)"
            />
            <div className="recurrencePreview">
              {t("next") || "Next"}: {nextPreview || (t("noNext") || "n/a")}
            </div>
          </div>
        )}

        <input type="submit" className="taskSubmit" value={t("save")} />
      </form>
    </div>
  );
};

export default AddTask;
