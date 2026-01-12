import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  batchUpdateDates,
  canDelete as canDeleteTask,
  canEdit as canEditTask,
  canManageCollaborators,
  createTask as createTaskDb,
  listenTasksForUser,
  restoreFromTrash,
  softDeleteTask,
  updateTask as updateTaskDb,
} from "../services/taskService";

const TaskContext = createContext({
  tasks: [],
  filteredTasks: [],
  loading: false,
  error: null,
  filters: { status: "", priority: "", date: "", search: "" },
  stats: { total: 0, active: 0, completed: 0, overdue: 0 },
  createTask: async () => {},
  updateTask: async () => {},
  batchUpdateDates: async () => {},
  deleteTask: async () => {},
  restoreTask: async () => {},
  setFilters: () => {},
  getTask: () => null,
  getPermissions: () => ({ role: "viewer", canEdit: false, canDelete: false, canManageCollaborators: false }),
  refresh: () => {},
});

const calcStats = (tasks = []) => {
  const total = tasks.length;
  const active = tasks.filter((t) => t.status === "active" || t.status === "upcoming").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter((t) => {
    if (t.status === "completed" || t.status === "canceled") return false;
    if (t.status === "overdue") return true;
    if (!t.deadline && !t.dueDate) return false;
    const deadlineVal = t.dueDate || t.deadline;
    const d = new Date(deadlineVal);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }).length;
  return { total, active, completed, overdue };
};

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFiltersState] = useState({ status: "", priority: "", date: "", search: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?.uid) return undefined;
    setLoading(true);
    setError(null);
    const unsub = listenTasksForUser(user.uid, (list) => {
      setTasks(list);
      setLoading(false);
    });
    return () => unsub?.();
  }, [user?.uid, refreshKey]);

  const setFilters = useCallback((partial) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchStatus = filters.status ? task.status === filters.status : true;
      const matchPriority = filters.priority ? task.priority === filters.priority : true;
      const matchDate =
        filters.date && (task.dueDate || task.deadline)
          ? new Date(task.dueDate || task.deadline) >= new Date(filters.date)
          : true;
      const matchSearch = filters.search
        ? (task.title || "").toLowerCase().includes(filters.search.toLowerCase())
        : true;
      return matchStatus && matchPriority && matchDate && matchSearch;
    });
  }, [tasks, filters]);

  const stats = useMemo(() => calcStats(tasks), [tasks]);

  const createTask = useCallback(
    async (payload) => {
      if (!user?.uid) throw new Error("No user");
      const id = await createTaskDb({
        ...payload,
        ownerId: payload.ownerId || user.uid,
        ownerUsername: payload.ownerUsername || user.username || "",
        ownerName: payload.ownerName || user.displayName || user.email || "",
        participants: payload.participants || [user.uid],
      });
      return id;
    },
    [user]
  );

  const updateTask = useCallback(async (taskId, patch) => {
    if (!taskId) return;
    const prev = tasks;
    setTasks((current) =>
      current.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
    );
    try {
      await updateTaskDb(taskId, patch);
    } catch (err) {
      console.error("updateTask error", err);
      setTasks(prev);
      setError(err);
    }
  }, [tasks]);

  const deleteTask = useCallback(
    async (taskId) => {
      if (!taskId) return null;
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return null;
      setTasks((current) => current.filter((t) => t.id !== taskId));
      try {
        const trashId = await softDeleteTask(target);
        return { trashId, task: target };
      } catch (err) {
        console.error("deleteTask error", err);
        setError(err);
        setTasks((current) => (current.some((t) => t.id === taskId) ? current : [...current, target]));
        return null;
      }
    },
    [tasks]
  );

  const restoreTask = useCallback(async (trashItem) => {
    try {
      return await restoreFromTrash(trashItem);
    } catch (err) {
      console.error("restoreTask error", err);
      setError(err);
      return null;
    }
  }, []);

  const handleBatchUpdateDates = useCallback(async (updates) => {
    try {
      await batchUpdateDates(updates);
    } catch (err) {
      console.error("batchUpdateDates error", err);
      setError(err);
    }
  }, []);

  const getTask = useCallback((id) => tasks.find((t) => t.id === id), [tasks]);

  const getPermissions = useCallback(
    (taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !user?.uid) {
        return { role: "viewer", canEdit: false, canDelete: false, canManageCollaborators: false };
      }
      const collaborators = Array.isArray(task.collaborators) ? task.collaborators : [];
      const ownerId = task.ownerId || task.userId;
      const collab = collaborators.find((c) => c.uid === user.uid);
      const role = ownerId === user.uid ? "owner" : collab?.role || "viewer";
      return {
        role,
        canEdit: canEditTask(task, user.uid),
        canDelete: canDeleteTask(task, user.uid),
        canManageCollaborators: canManageCollaborators(task, user.uid),
      };
    },
    [tasks, user?.uid]
  );

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        loading,
        error,
        filters,
        stats,
        createTask,
        updateTask,
        batchUpdateDates: handleBatchUpdateDates,
        deleteTask,
        restoreTask,
        setFilters,
        getTask,
        getPermissions,
        refresh,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
