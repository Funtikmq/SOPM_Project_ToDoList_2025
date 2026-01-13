/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "./AuthContext";
import { logActivity } from "../services/activityService";
import { buildSearchTokens } from "../services/searchTokens";

const TaskContext = createContext({
  tasks: [],
  stats: { total: 0, upcoming: 0, active: 0, completed: 0, overdue: 0, canceled: 0 },
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  undoDelete: async () => {},
  restoreTask: async () => {},
  addSubtask: async () => {},
  toggleSubtask: async () => {},
  removeSubtask: async () => {},
  markAllSubtasksDone: async () => {},
  addComment: async () => {},
  editComment: async () => {},
  deleteComment: async () => {},
});

// Normalizeaza deadline ca data, folosim final de zi pentru comparatii corecte.
export const parseDeadline = (deadline) => {
  if (!deadline) return null;
  const parsed = new Date(`${deadline}T23:59:59`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Normalizeaza statusuri vechi/locale ca sa fie consistente in UI si stats.
const normalizeStatus = (status) => {
  if (!status) return "active";
  const raw = status.toString().trim().toLowerCase();
  const cleaned = raw.startsWith("status.") ? raw.slice(7) : raw;
  const ascii = cleaned.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const map = {
    active: "active",
    upcoming: "upcoming",
    completed: "completed",
    overdue: "overdue",
    canceled: "canceled",
    cancelled: "canceled",
    activa: "active",
    viitoare: "upcoming",
    finalizat: "completed",
    intarziat: "overdue",
    anulat: "canceled",
  };
  return map[ascii] || "active";
};

// Normalizeaza task-ul venit din Firestore (colaboratori, owner, status).
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
  const status = normalizeStatus(task.status);
  return { ...task, status, collaborators, ownerId, participants, shared };
};

// Calculeaza stats din lista curenta, fara cache, doar pe status.
const calcStats = (tasks) => {
  const total = tasks.length;
  const upcoming = tasks.filter((t) => t.status === "upcoming").length;
  const active = tasks.filter((t) => t.status === "active").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const canceled = tasks.filter((t) => t.status === "canceled").length;
  const overdue = tasks.filter((t) => t.status === "overdue").length;

  return { total, upcoming, active, completed, overdue, canceled };
};

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subtasksMap, setSubtasksMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const subtasksUnsubRef = useRef({});
  const commentsUnsubRef = useRef({});

  // Atasam task-urile utilizatorului si rulam o migrare usoara pentru campuri vechi.
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setSubtasksMap({});
      setCommentsMap({});
      Object.values(subtasksUnsubRef.current).forEach((fn) => fn());
      Object.values(commentsUnsubRef.current).forEach((fn) => fn());
      subtasksUnsubRef.current = {};
      commentsUnsubRef.current = {};
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
  // Ascultam subtask-urile pentru fiecare task activ.
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

  // Cleanup global pentru listener-ele de subtask-uri si comentarii.
  useEffect(
    () => () => {
      Object.values(subtasksUnsubRef.current).forEach((fn) => fn());
      subtasksUnsubRef.current = {};
      setSubtasksMap({});
      Object.values(commentsUnsubRef.current).forEach((fn) => fn());
      commentsUnsubRef.current = {};
      setCommentsMap({});
    },
    []
  );

  // Maintain comments listeners per task (subcollection `/tasks/{id}/comments`)
  // Ascultam comentariile pentru fiecare task activ.
  useEffect(() => {
    if (!user || !tasks.length) return undefined;

    const activeIds = new Set(tasks.map((t) => t.id));

    // Unsubscribe listeners for removed tasks
    Object.keys(commentsUnsubRef.current).forEach((taskId) => {
      if (!activeIds.has(taskId)) {
        commentsUnsubRef.current[taskId]?.();
        delete commentsUnsubRef.current[taskId];
        setCommentsMap((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
    });

    // Attach listeners for new tasks
    activeIds.forEach((taskId) => {
      if (commentsUnsubRef.current[taskId]) return;
      const q = query(collection(db, "tasks", taskId, "comments"), orderBy("createdAt", "asc"));
      const unsub = onSnapshot(q, (snap) => {
        const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCommentsMap((prev) => ({ ...prev, [taskId]: comments }));
      });
      commentsUnsubRef.current[taskId] = unsub;
    });

    return undefined;
  }, [tasks, user]);

  // Combinam task-urile cu subtask-uri si comentarii din subcolectii.
  const tasksWithSubtasks = useMemo(
    () =>
      tasks.map((t) => ({
        ...t,
        subtasks: subtasksMap[t.id] || [],
        comments: commentsMap[t.id] || [],
      })),
    [tasks, subtasksMap, commentsMap]
  );

  // Grupam task-urile pe deadline pentru calendar.
  const tasksByDate = useMemo(() => {
    const map = {};
    tasksWithSubtasks.forEach((t) => {
      if (!t.deadline) return;
      const key = t.deadline;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasksWithSubtasks]);

  // Wrapper pentru logarea activitatii in istoricul task-ului.
  const recordActivity = useCallback(
    async (taskId, payload) => {
      if (!user || !taskId) return;
      const actorName = user.username || user.displayName || user.email || "user";
      await logActivity(taskId, {
        actorUid: user.uid,
        actorName,
        ...payload,
      });
    },
    [user]
  );

  // Creeaza task nou si il salveaza in Firestore cu tokeni de cautare.
  const addTask = useCallback(
    async ({
      title,
      description = "",
      priority = "medium",
      deadline = "",
      tags = [],
      collaborators = [],
    }) => {
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
          collaborators,
          tags,
          shared: false,
          searchTokens: buildSearchTokens({
            title: cleanTitle,
            tags,
            priority,
            collaborators,
            status: "active",
            deadline,
          }),
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
      await recordActivity(cleanId, {
        type: "task_created",
        to: { title: cleanTitle },
      });
      return cleanId;
    },
    [recordActivity, user]
  );

  // Sterge task-ul: il muta in trash si il elimina din colectia principala.
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
        await recordActivity(id, {
          type: "task_deleted",
          from: taskToDelete.title || null,
          to: null,
        });
        await deleteDoc(doc(db, "tasks", id));
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        return { task: taskToDelete, trashId: trashRef.id };
      } catch (err) {
        console.error("Delete error", err);
        throw err;
      }
    },
    [recordActivity, tasks, user]
  );

  // Undo pentru stergere: reface task-ul din trash.
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

  // Restore din Recycle Bin cu normalizare si actualizare tokens.
  const restoreTask = useCallback(
    async ({ originalId, docId, ...rest }) => {
      if (!user || !originalId) return;
      try {
        const clean = { ...rest };
        delete clean.deletedAt;
        const restored = normalizeTask({ ...clean, id: originalId }, user.uid);
        await setDoc(
          doc(db, "tasks", originalId),
          {
            ...restored,
            searchTokens: buildSearchTokens(restored),
          },
          { merge: true }
        );
        if (docId) {
          await deleteDoc(doc(db, "trash", docId));
        }
        setTasks((prev) => {
          const exists = prev.some((t) => t.id === originalId);
          return exists ? prev.map((t) => (t.id === originalId ? restored : t)) : [...prev, restored];
        });
      } catch (err) {
        console.warn("restoreTask error", err);
      }
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
      await recordActivity(taskId, {
        type: "subtask_added",
        to: clean,
      });
    },
    [recordActivity, user]
  );

  const toggleSubtask = useCallback(
    async (taskId, subtaskId, nextDone, title = "") => {
      if (!user || !taskId || !subtaskId) return;
      await updateDoc(doc(db, "tasks", taskId, "subtasks", subtaskId), {
        done: nextDone,
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid,
      });
      await recordActivity(taskId, {
        type: "subtask_completed",
        from: nextDone ? false : true,
        to: nextDone,
        extra: title || undefined,
      });
    },
    [recordActivity, user]
  );

  const removeSubtask = useCallback(
    async (taskId, subtaskId, title = "") => {
      if (!user || !taskId || !subtaskId) return;
      await deleteDoc(doc(db, "tasks", taskId, "subtasks", subtaskId));
      await recordActivity(taskId, {
        type: "subtask_removed",
        from: title || null,
      });
    },
    [recordActivity, user]
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

  const extractMentions = (text) => {
    const regex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;
    while ((match = regex.exec(text || ""))) {
      mentions.push({ username: match[1] });
    }
    return mentions;
  };

  const addComment = useCallback(
    async (taskId, { text, attachments = [] }) => {
      if (!user || !taskId) return;
      const clean = (text || "").trim();
      if (!clean && attachments.length === 0) return;
      try {
        await addDoc(collection(db, "tasks", taskId, "comments"), {
          taskId,
          text: clean,
          attachments,
          mentions: extractMentions(clean),
          userId: user.uid,
          username: user.username || user.displayName || user.email || "user",
          authorId: user.uid,
          authorName: user.displayName || user.email || user.username || "User",
          authorUsername: user.username || user.email || "",
          authorAvatar: user.avatarUrl || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          edited: false,
        });
        await recordActivity(taskId, {
          type: "comment_added",
          to: clean || "comment",
        });
      } catch (err) {
        console.warn("addComment error", err);
      }
    },
    [recordActivity, user]
  );

  const editComment = useCallback(
    async (taskId, commentId, nextText, nextAttachments) => {
      if (!user || !taskId || !commentId) return;
      const clean = (nextText || "").trim();
      try {
        const patch = {
          text: clean,
          mentions: extractMentions(clean),
          updatedAt: serverTimestamp(),
          edited: true,
          lastEditedBy: user.uid,
        };
        if (Array.isArray(nextAttachments)) {
          patch.attachments = nextAttachments;
        }
        await updateDoc(doc(db, "tasks", taskId, "comments", commentId), patch);
      } catch (err) {
        console.warn("editComment error", err);
      }
    },
    [user]
  );

  // Update task + logare activitate pentru campuri importante.
  const updateTask = useCallback(
    async (id, updatedFields) => {
      if (!user || !id) return;
      const prevTask = tasks.find((t) => t.id === id);
      const merged = { ...prevTask, ...updatedFields };
      await updateDoc(doc(db, "tasks", id), {
        ...updatedFields,
        searchTokens: buildSearchTokens(merged),
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? normalizeTask({ ...task, ...updatedFields }, user.uid) : task
        )
      );

      // activity logging for key fields
      if (prevTask) {
        const changes = [
          { key: "status", type: "status_changed" },
          { key: "title", type: "title_changed" },
          { key: "priority", type: "priority_changed" },
          { key: "deadline", type: "deadline_changed" },
          { key: "description", type: "description_changed" },
        ];
        await Promise.all(
          changes
            .filter(({ key }) => Object.prototype.hasOwnProperty.call(updatedFields, key))
            .filter(({ key }) => prevTask[key] !== updatedFields[key])
            .map(({ key, type }) =>
              recordActivity(id, {
                type,
                from: prevTask[key] || null,
                to: updatedFields[key] || null,
              })
            )
        );

      }
    },
    [recordActivity, tasks, user]
  );

  const deleteComment = useCallback(
    async (taskId, commentId) => {
      if (!user || !taskId || !commentId) return;
      try {
        await deleteDoc(doc(db, "tasks", taskId, "comments", commentId));
      } catch (err) {
        console.warn("deleteComment error", err);
      }
    },
    [user]
  );

  // Expunem state-ul si actiunile prin context.
  const value = useMemo(
    () => ({
      tasks: tasksWithSubtasks,
      tasksByDate,
      stats,
      addTask,
      updateTask,
      deleteTask,
      undoDelete,
      restoreTask,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      markAllSubtasksDone,
      addComment,
      editComment,
      deleteComment,
    }),
    [
      tasksWithSubtasks,
      tasksByDate,
      stats,
      addTask,
      updateTask,
      deleteTask,
      undoDelete,
      restoreTask,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      markAllSubtasksDone,
      addComment,
      editComment,
      deleteComment,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);
