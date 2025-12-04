import { useState, useEffect, useRef } from "react";
import { useTranslate } from "../translation";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

import ListHead from "./ListHead";
import Task from "./Task";
import Dropdown from "./Dropdown";

import "./List.css";

const List = ({ onToggleAddTask }) => {
  const [tasks, setTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState({ status: "", priority: "", date: "" });
  const [search, setSearch] = useState("");

  const { user } = useAuth();
  const { t } = useTranslate();
  const undoTimer = useRef(null);
  const [undoData, setUndoData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskList);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    return () => {
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
    };
  }, []);

  const handleUpdate = async (id, updatedFields) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, updatedFields);

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  const clearUndoTimer = () => {
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
  };

  const handleDelete = async (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    try {
      const trashRef = await addDoc(collection(db, "trash"), {
        ...taskToDelete,
        originalId: id,
        userId: user?.uid,
        deletedAt: Date.now(),
      });
      await deleteDoc(doc(db, "tasks", id));
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      setUndoData({ task: taskToDelete, trashId: trashRef.id });
      clearUndoTimer();
      undoTimer.current = setTimeout(() => {
        setUndoData(null);
      }, 5000);
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleUndo = async () => {
    if (!undoData || !user) return;
    const { task, trashId } = undoData;
    clearUndoTimer();
    setUndoData(null);
    try {
      await setDoc(doc(db, "tasks", task.id), {
        ...task,
        userId: user.uid,
      });
      await deleteDoc(doc(db, "trash", trashId));
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === task.id);
        return exists ? prev : [...prev, task];
      });
    } catch (err) {
      console.error("Undo error", err);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const statusOrder = ["upcoming", "active", "completed", "overdue", "canceled"];
  const priorityOrder = ["high", "medium", "low"];

  const filteredTasks = tasks.filter((task) => {
    const matchSearch = search
      ? task.title?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = filter.status ? task.status === filter.status : true;
    const matchPriority = filter.priority ? task.priority === filter.priority : true;
    const matchDate =
      filter.date && task.deadline
        ? new Date(task.deadline) >= new Date(filter.date)
        : true;

    return matchSearch && matchStatus && matchPriority && matchDate;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "status") {
      aValue = statusOrder.indexOf(aValue);
      bValue = statusOrder.indexOf(bValue);
    } else if (sortConfig.key === "priority") {
      aValue = priorityOrder.indexOf(aValue);
      bValue = priorityOrder.indexOf(bValue);
    } else if (sortConfig.key === "deadline") {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
    } else if (sortConfig.key === "title") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="listContainer">
      <div className="listHeaderTop">
        <h3 className="containerTitle">
          <span>{t("taskList")}</span>
          <span className="titleAccent" />
        </h3>
        <div className="listActions">
          <div className="searchBox">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="m20.3 21.7l-6.15-6.15q-.725.6-1.638.925T10.6 16.8q-2.7 0-4.6-1.9T4.1 10.3t1.9-4.6t4.6-1.9t4.6 1.9t1.9 4.6q0 .95-.262 1.862t-.913 1.738l6.15 6.15zm-9.7-6.9q1.875 0 3.188-1.312T15.1 10.3t-1.312-3.188T10.6 5.8T7.412 7.112T6.1 10.3t1.312 3.188T10.6 14.8"
              />
            </svg>
            <input
              type="text"
              placeholder={t("title")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="filterButton" onClick={() => setFilterVisible((prev) => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 432 472">
              <path
                fill="currentColor"
                d="m169 399l43 32q10 9 25 9q6 0 20-4q23-12 23-39V246L419 73q17-21 4-45q-15-25-38-25H47Q18 3 9 26q-10 26 4 45l139 175v119q0 22 17 34zM47 45h338L237 229v168l-42-32V229z"
              />
            </svg>
          </button>
          <button className="filterButton" onClick={onToggleAddTask}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
        </div>
      </div>

      {filterVisible && (
        <div className="filterPanel">
          <label>
            {t("status")}:
            <Dropdown
              value={filter.status}
              onChange={(val) => setFilter({ ...filter, status: val })}
              options={[
                { value: "", label: t("all") },
                ...statusOrder.map((s) => ({ value: s, label: t(s) })),
              ]}
              placeholder={t("all")}
            />
          </label>

          <label>
            {t("priority")}:
            <Dropdown
              value={filter.priority}
              onChange={(val) => setFilter({ ...filter, priority: val })}
              options={[
                { value: "", label: t("all") },
                ...priorityOrder.map((p) => ({ value: p, label: t(p) })),
              ]}
              placeholder={t("all")}
            />
          </label>

          <label>
            {t("untilDate")}:
            <Dropdown
              value={filter.date}
              onChange={(val) => setFilter({ ...filter, date: val })}
              placeholder={t("untilDate")}
              isDate
            />
          </label>
        </div>
      )}

      <ul className="list">
        <li className="listItem">
          <ListHead onSort={handleSort} sortConfig={sortConfig} />
        </li>

        {sortedTasks.length === 0 && (
          <li className="listItem emptyState">
            <div className="emptyStateIcon">✨</div>
            <div className="emptyStateText">{t("noTasks")}</div>
            <button className="addTaskInlineButton" onClick={onToggleAddTask}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="addTaskIcon"
              >
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
              <span>{t("addNewTask")}</span>
            </button>
          </li>
        )}

        {sortedTasks.map((task) => (
          <li className="listItem" key={task.id}>
            <Task taskData={task} onUpdate={handleUpdate} onDelete={handleDelete} />
          </li>
        ))}

        {sortedTasks.length > 0 && sortedTasks.length <= 3 && (
          <li className="listItem addTaskListItem">
            <button className="addTaskInlineButton" onClick={onToggleAddTask}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="addTaskIcon"
              >
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
              <span>{t("addNewTask")}</span>
            </button>
          </li>
        )}
      </ul>
      {undoData && (
        <div className="undoToast">
          <span>{t("taskDeleted")}</span>
          <button onClick={handleUndo}>{t("undo")}</button>
        </div>
      )}
    </div>
  );
};

export default List;

