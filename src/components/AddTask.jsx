import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslate } from "../translation";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import "./AddTask.css";
import Dropdown from "./ui/Dropdown";
import { calculateNextDate } from "../services/recurrenceUtils";
import { generateTaskInsights } from "../services/aiService";

const AddTask = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [aiSubtasks, setAiSubtasks] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [interval, setInterval] = useState(1);
  const [weekday, setWeekday] = useState("mon");
  const [monthday, setMonthday] = useState(1);
  const [endDate, setEndDate] = useState("");
  const [autoCreateWindow, setAutoCreateWindow] = useState(7);
  const { t } = useTranslate();
  const { addTask, addSubtask } = useTasks();
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
      if (taskId && aiSubtasks.length) {
        for (const sub of aiSubtasks) {
          if (sub) await addSubtask(taskId, sub);
        }
      }
      alert(t("taskSaved"));

      setTitle("");
      setDesc("");
      setPriority("medium");
      setDeadline("");
      setAiSubtasks([]);
      setAiResult(null);
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
      <h3 className="containerTitle">{t("addTask")}</h3>

      <form className="taskForm" onSubmit={handleSubmit}>
        <div className="formRow">
          <h5 className="formLabel">{t("title")}</h5>
          <button type="button" className="aiAssistBtn" onClick={() => setShowAiModal(true)}>
            ✨ AI Assist
          </button>
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

        {aiSubtasks.length > 0 && (
          <div className="aiSubtasksPreview">
            <div className="aiPreviewTitle">AI Subtasks</div>
            <div className="aiPills">
              {aiSubtasks.map((s, idx) => (
                <span key={`${s}-${idx}`} className="aiPill">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <input type="submit" className="taskSubmit" value={t("save")} />
      </form>

      {showAiModal &&
        createPortal(
          <div className="aiModalOverlay" onClick={() => !aiLoading && setShowAiModal(false)}>
            <div className="aiModal" onClick={(e) => e.stopPropagation()}>
              <div className="aiModalHeader">
                <h4>AI Task Assistant</h4>
                <button className="aiClose" onClick={() => setShowAiModal(false)} disabled={aiLoading}>
                  ×
                </button>
              </div>
              <div className="aiModalBody">
                <p className="aiHint">Get subtasks, deadline, and priority suggestions based on the title.</p>
                <input
                  type="text"
                  className="taskInput"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
                <button
                  type="button"
                  className="aiGenerateBtn"
                  onClick={async () => {
                    if (!title.trim()) {
                      setAiError("Add a title first.");
                      return;
                    }
                    setAiError("");
                    setAiLoading(true);
                    try {
                      const res = await generateTaskInsights(title.trim());
                      setAiResult(res);
                    } catch (err) {
                      console.warn(err);
                      setAiError("Nu am putut genera sugestiile. Încearcă din nou.");
                    } finally {
                      setAiLoading(false);
                    }
                  }}
                  disabled={aiLoading}
                >
                  {aiLoading ? "Generating..." : "Generate"}
                </button>

                {aiError && <div className="aiError">{aiError}</div>}

                {aiResult && (
                  <div className="aiResults">
                    <div className="aiResultBlock">
                      <div className="aiResultTitle">Suggested Priority</div>
                      <div className="aiResultBadge">{aiResult.suggestedPriority || "-"}</div>
                    </div>
                    <div className="aiResultBlock">
                      <div className="aiResultTitle">Suggested Deadline</div>
                      <div className="aiResultBadge">{aiResult.suggestedDeadline || "-"}</div>
                    </div>
                    <div className="aiResultBlock">
                      <div className="aiResultTitle">Subtasks</div>
                      <div className="aiPills">
                        {(aiResult.subtasks || []).map((s, idx) => (
                          <span key={`${s}-${idx}`} className="aiPill">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="aiResultBlock">
                      <div className="aiResultTitle">Today's Plan</div>
                      <ul className="aiPlanList">
                        {(aiResult.dailyPlan || []).map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <div className="aiModalFooter">
                <button
                  className="aiApplyBtn"
                  onClick={() => {
                    if (aiResult?.suggestedPriority) setPriority(aiResult.suggestedPriority.toLowerCase());
                    if (aiResult?.suggestedDeadline) setDeadline(aiResult.suggestedDeadline);
                    if (aiResult?.subtasks?.length) setAiSubtasks(aiResult.subtasks);
                    setShowAiModal(false);
                  }}
                  disabled={!aiResult || aiLoading}
                >
                  Apply to task
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AddTask;
