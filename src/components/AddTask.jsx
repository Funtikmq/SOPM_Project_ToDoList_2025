import { useState } from "react";
import { useTranslate } from "../translation";
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./AddTask.css";
import Dropdown from "./ui/Dropdown";

const AddTask = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const { t } = useTranslate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim() === "" || deadline.trim() === "") {
      alert(t("fillRequired"));
      return;
    }

    const timestamp = Date.now();
    const cleanTitle = title.replace(/\s+/g, "_");
    const customId = `${cleanTitle}_${timestamp}`;

    try {
      await setDoc(doc(db, "tasks", customId), {
        id: customId,
        title,
        status: "active",
        description: desc,
        priority,
        deadline,
        createdAt: timestamp,
        userId: user.uid,
        subtasks: [],
      });

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
      <h3 className="containerTitle">{t("addTask")}</h3>

      <form className="taskForm" onSubmit={handleSubmit}>
        <h5>{t("title")}</h5>
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
