import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

import ListHead from "./ListHead";
import Task from "./Task";

import "./List.css";

const List = ({ onToggleAddTask }) => {
  const [tasks, setTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState({ status: "", priority: "", month: "" });

  const { user } = useAuth();
const { t } = useTranslate();
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

  const handleUpdate = async (id, updatedFields) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, updatedFields);

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  const handleDelete = async (id) => {
    const taskRef = doc(db, "tasks", id);
    await deleteDoc(taskRef);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const statusOrder = [
    "upcoming",
    "active",
    "completed",
    "overdue",
    "canceled",
  ];
  const priorityOrder = ["high", "medium", "low"];

  // Aplicam filtrul
  const filteredTasks = tasks.filter((task) => {
    const matchStatus = filter.status ? task.status === filter.status : true;
    const matchPriority = filter.priority
      ? task.priority === filter.priority
      : true;
    const matchDate =
      filter.date && task.deadline
        ? new Date(task.deadline) >= new Date(filter.date)
        : true;

    return matchStatus && matchPriority && matchDate;
  });

  // Aplicam sortarea
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
        <h3 className="containerTitle">{t("taskList")}</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="filterButton"
            onClick={() => setFilterVisible((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 432 472"
            >
              <path
                fill="currentColor"
                d="m169 399l43 32q10 9 25 9q6 0 20-4q23-12 23-39V246L419 73q17-21 4-45q-15-25-38-25H47Q18 3 9 26q-10 26 4 45l139 175v119q0 22 17 34zM47 45h338L237 229v168l-42-32V229z"
              />
            </svg>
          </button>
          <button className="filterButton" onClick={onToggleAddTask}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {filterVisible && (
        <div className="filterPanel">
          <label>
            {t("status")}:
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">{t("all")}</option>
              {statusOrder.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t("priority")}:
            <select
              value={filter.priority}
              onChange={(e) =>
                setFilter({ ...filter, priority: e.target.value })
              }
            >
              <option value="">{t("all")}</option>
              {priorityOrder.map((p) => (
                <option key={p} value={p}>
                  {t(p)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t("untilDate")}:
            <input
              type="date"
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            />
          </label>
        </div>
      )}

      <ul className="list">
        <li className="listItem">
          <ListHead onSort={handleSort} sortConfig={sortConfig} />
        </li>
        {sortedTasks.map((task) => (
          <li className="listItem" key={task.id}>
            <Task
              taskData={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </li>
        ))}

        {sortedTasks.length <= 3 && (
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
    </div>
  );
};

export default List;
