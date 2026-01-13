import { useState } from "react";
import { useTranslate } from "../translation";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import "./AddTask.css";
import Dropdown from "./ui/Dropdown";

const AddTask = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
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
      const taskId = await addTask({
        title,
        description: desc,
        priority,
        deadline,
      });
      if (!taskId) return;
      alert(t("taskSaved"));

      setTitle("");
      setDesc("");
      setPriority("medium");
      setDeadline("");
    } catch (err) {
      console.log("Error:", err);
    }
  };

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

        <input type="submit" className="taskSubmit" value={t("save")} />
      </form>
    </div>
  );
};

export default AddTask;
