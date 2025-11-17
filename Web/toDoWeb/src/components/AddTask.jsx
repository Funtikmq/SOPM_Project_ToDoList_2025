import { useState } from "react";
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import "./AddTask.css";

const AddTask = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim() === "" || deadline.trim() === "") {
      alert("Completeaza titlul si deadline-ul!");
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
      });

      alert("Task salvat!");

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
      <h3 className="containerTitle">Adauga Sarcina</h3>

      <form className="taskForm" onSubmit={handleSubmit}>
        <h5>Titlu *</h5>
        <input
          type="text"
          className="taskInput"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <h5>Descriere (optional)</h5>
        <textarea
          className="taskInput taskText"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        ></textarea>

        <h5>Prioritate</h5>
        <select
          className="taskInput"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">Mare</option>
          <option value="medium">Medie</option>
          <option value="low">Mica</option>
        </select>

        <h5>Deadline *</h5>
        <input
          type="date"
          className="taskInput"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        <input type="submit" className="taskSubmit" value="Save" />
      </form>
    </div>
  );
};

export default AddTask;
