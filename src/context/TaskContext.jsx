import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  writeBatch,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "./AuthContext";

const TaskContext = createContext({
  tasks: [],
  stats: { total: 0, active: 0, completed: 0, overdue: 0 },
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  undoDelete: async () => {},
  addSubtask: async () => {},
  toggleSubtask: async () => {},
  removeSubtask: async () => {},
  markAllSubtasksDone: async () => {},
});

export const parseDeadline = (deadline) => {
  if (!deadline) return null;
  const parsed = new Date(`${deadline}T23:59:59`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeTask = (task, fallbackUid) => {
  const collaborators = Array.isArray(task.collaborators) ? task.collaborators : [];
  const ownerId = task.ownerId || task.userId || fallbackUid;
  const participants =
    Array.isArray(task.participants) && task.participants.length
      ? task.participants
      : ownerId
        ? [ownerId]
        : [];
  const shared = typeof task.shared === "boolean" ? task.shared : collaborators.length > 0;
  return { ...task, collaborators, ownerId, participants, shared };
};

const calcStats = (tasks) => {
  const now = new Date();
  const total = tasks.length;
  const active = tasks.filter((t) => t.status === "active" || t.status === "upcoming").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const overdue = tasks.filter((t) => {
    const dl = parseDeadline(t.deadline);
    if (!dl) return false;
    if (t.status === "completed" || t.status === "canceled") return false;
    return dl.getTime() < now.getTime();
  }).length;

  return { total, active, completed, overdue };
};

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subtasksMap, setSubtasksMap] = useState({});
  const subtasksUnsubRef = useRef({});

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setSubtasksMap({});
      Object.values(subtasksUnsubRef.current).forEach((fn) => fn());
      subtasksUnsubRef.current = {};
      return undefined;
    }

    const migrateLegacyTasks = async () => {
      try {
        const legacySnap = await getDocs(
          query(collection(db, "tasks"), where("userId", "==", user.uid))
        );
        const updates = [];
        legacySnap.forEach((d) => {
          const data = d.data();
          if (!Array.isArray(data.participants) || data.participants.length === 0) {
            const ownerId = data.ownerId || data.userId || user.uid;
            updates.push(
              setDoc(
                doc(db, "tasks", d.id),
                {
                  ownerId,
                  ownerUsername:
                    data.ownerUsername ||
                    (ownerId === user.uid ? user.username || "" : data.ownerUsername || ""),
                  ownerName:
                    data.ownerName ||
                    data.displayName ||
                    user.displayName ||
                    user.email ||
                    "",
                  participants: ownerId ? [ownerId] : [],
                  collaborators: Array.isArray(data.collaborators) ? data.collaborators : [],
                  shared: Array.isArray(data.collaborators)
                    ? data.collaborators.length > 0
                    : false,
                },
                { merge: true }
              )
            );
          }
        });
        if (updates.length) await Promise.all(updates);
      } catch (err) {
        console.error("task migration error", err);
      }
    };

    migrateLegacyTasks();

    const q = query(collection(db, "tasks"), where("participants", "array-contains", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map((docSnap) =>
        normalizeTask({ id: docSnap.id, ...docSnap.data() }, user.uid)
      );
      setTasks(taskList);
    });

    return () => unsubscribe();
  }, [user]);

  // Maintain subtasks listeners per task (subcollection `/tasks/{id}/subtasks`)
  useEffect(() => {
    if (!user || !tasks.length) return undefined;

    const activeIds = new Set(tasks.map((t) => t.id));

    // Unsubscribe listeners for removed tasks
    Object.keys(subtasksUnsubRef.current).forEach((taskId) => {
      if (!activeIds.has(taskId)) {
        subtasksUnsubRef.current[taskId]?.();
        delete subtasksUnsubRef.current[taskId];
        setSubtasksMap((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
    });

    // Attach listeners for new tasks
    activeIds.forEach((taskId) => {
      if (subtasksUnsubRef.current[taskId]) return;
      const q = query(collection(db, "tasks", taskId, "subtasks"));
      const unsub = onSnapshot(q, (snap) => {
        const subtasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSubtasksMap((prev) => ({ ...prev, [taskId]: subtasks }));
      });
      subtasksUnsubRef.current[taskId] = unsub;
    });

    // Cleanup only on unmount/user change handled elsewhere
    return undefined;
  }, [tasks, user]);

  useEffect(
    () => () => {
      Object.values(subtasksUnsubRef.current).forEach((fn) => fn());
      subtasksUnsubRef.current = {};
      setSubtasksMap({});
    },
    []
  );

  const tasksWithSubtasks = useMemo(
    () =>
      tasks.map((t) => ({
        ...t,
        subtasks: subtasksMap[t.id] || [],
      })),
    [tasks, subtasksMap]
  );

  const addTask = useCallback(
    async ({ title, description = "", priority = "medium", deadline = "" }) => {
      if (!user) return null;
      const timestamp = Date.now();
      const cleanTitle = title.trim();
      const cleanId = `${cleanTitle.replace(/\s+/g, "_") || "task"}_${timestamp}`;
      const payload = normalizeTask(
        {
          id: cleanId,
          title: cleanTitle,
          status: "active",
          description,
          priority,
          deadline,
          createdAt: timestamp,
          ownerId: user.uid,
          ownerUsername: user.username || "",
          ownerName: user.displayName || user.email || "",
          participants: [user.uid],
          collaborators: [],
          shared: false,
        },
        user.uid
      );

      await setDoc(doc(db, "tasks", cleanId), payload, { merge: true });
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === cleanId);
        return exists
          ? prev.map((t) => (t.id === cleanId ? payload : t))
          : [...prev, payload];
      });
      return cleanId;
    },
    [user]
  );

  const updateTask = useCallback(
    async (id, updatedFields) => {
      if (!user || !id) return;
      await updateDoc(doc(db, "tasks", id), {
        ...updatedFields,
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? normalizeTask({ ...task, ...updatedFields }, user.uid) : task
        )
      );
    },
    [user]
  );

  const deleteTask = useCallback(
    async (id) => {
      if (!user || !id) return null;
      const taskToDelete = tasks.find((t) => t.id === id);
      if (!taskToDelete || (taskToDelete.ownerId && taskToDelete.ownerId !== user.uid)) return null;

      try {
        const ownerId = taskToDelete.ownerId || user.uid;
        const existingOwner = ownerId
          ? await getDocs(
              query(
                collection(db, "trash"),
                where("ownerId", "==", ownerId),
                where("originalId", "==", id)
              )
            )
          : { docs: [] };
        const existingUser = await getDocs(
          query(
            collection(db, "trash"),
            where("userId", "==", user.uid),
            where("originalId", "==", id)
          )
        );
        const toDelete = [...existingOwner.docs, ...existingUser.docs];
        await Promise.all(toDelete.map((d) => deleteDoc(doc(db, "trash", d.id))));

        const trashRef = await addDoc(collection(db, "trash"), {
          ...taskToDelete,
          originalId: id,
          ownerId: ownerId || user.uid,
          userId: ownerId || user.uid,
          deletedAt: Date.now(),
        });
        await deleteDoc(doc(db, "tasks", id));
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        return { task: taskToDelete, trashId: trashRef.id };
      } catch (err) {
        console.error("Delete error", err);
        throw err;
      }
    },
    [tasks, user]
  );

  const undoDelete = useCallback(
    async (undoData) => {
      if (!user || !undoData?.task || !undoData?.trashId) return;
      const { task, trashId } = undoData;
      const normalized = normalizeTask(task, user.uid);
      await setDoc(doc(db, "tasks", task.id), normalized);
      await deleteDoc(doc(db, "trash", trashId));
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === task.id);
        return exists
          ? prev.map((t) => (t.id === task.id ? normalized : t))
          : [...prev, normalized];
      });
    },
    [user]
  );

  const stats = useMemo(() => calcStats(tasks), [tasks]);

  const addSubtask = useCallback(
    async (taskId, title) => {
      if (!user || !taskId) return;
      const clean = title.trim();
      if (!clean) return;
      await addDoc(collection(db, "tasks", taskId, "subtasks"), {
        taskId,
        title: clean,
        done: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid,
      });
    },
    [user]
  );

  const toggleSubtask = useCallback(
    async (taskId, subtaskId, nextDone) => {
      if (!user || !taskId || !subtaskId) return;
      await updateDoc(doc(db, "tasks", taskId, "subtasks", subtaskId), {
        done: nextDone,
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid,
      });
    },
    [user]
  );

  const removeSubtask = useCallback(
    async (taskId, subtaskId) => {
      if (!user || !taskId || !subtaskId) return;
      await deleteDoc(doc(db, "tasks", taskId, "subtasks", subtaskId));
    },
    [user]
  );

  const markAllSubtasksDone = useCallback(
    async (taskId, subtasks = []) => {
      if (!user || !taskId || !subtasks.length) return;
      const batch = writeBatch(db);
      subtasks.forEach((s) => {
        batch.update(doc(db, "tasks", taskId, "subtasks", s.id), {
          done: true,
          updatedAt: serverTimestamp(),
          lastEditedBy: user.uid,
        });
      });
      await batch.commit();
    },
    [user]
  );

  const value = useMemo(
    () => ({
      tasks: tasksWithSubtasks,
      stats,
      addTask,
      updateTask,
      deleteTask,
      undoDelete,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      markAllSubtasksDone,
    }),
    [
      tasksWithSubtasks,
      stats,
      addTask,
      updateTask,
      deleteTask,
      undoDelete,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      markAllSubtasksDone,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);
