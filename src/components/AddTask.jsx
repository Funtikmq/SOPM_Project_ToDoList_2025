import { useState } from "react";
import "./AddTask.css";
import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function AddTask() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medie");
  const [deadline, setDeadline] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    await addDoc(collection(db, "tasks"), {
      uid: user.uid,
      title: title.trim(),
      description: description.trim(),
      priority,
      deadline,
      status: "activa",
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDescription("");
    setPriority("Medie");
    setDeadline("");

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="taskFormContainer">
      <h3>Adaugă Sarcină</h3>

      <form className="taskForm" onSubmit={handleSubmit}>
        <h5>Titlu</h5>
        <input
          className="taskInput"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <h5>Descriere</h5>
        <textarea
          className="taskInput taskText"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <h5>Prioritate</h5>
        <select
          className="taskInput"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Mica">Mica</option>
          <option value="Medie">Medie</option>
          <option value="Mare">Mare</option>
        </select>

        <h5>Deadline</h5>
        <input
          type="date"
          className="taskInput"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button className="taskSubmit">
          {isSaved ? "SALVAT ✅" : "SALVEAZĂ"}
        </button>
      </form>
    </div>
  );
}
