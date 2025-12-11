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
import {
  addTagToTask as addTagToTaskService,
  removeTagFromTask as removeTagFromTaskService,
  subscribeToUserTags,
  createUserTag,
} from "../services/tagService";
import { calculateNextDate, formatDateYMD } from "../services/recurrenceUtils";
import { buildSearchTokens } from "../services/searchTokens";

const TaskContext = createContext({
  tasks: [],
  stats: { total: 0, active: 0, completed: 0, overdue: 0 },
  userTags: [],
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  undoDelete: async () => {},
  addSubtask: async () => {},
  toggleSubtask: async () => {},
  removeSubtask: async () => {},
  markAllSubtasksDone: async () => {},
  addComment: async () => {},
  editComment: async () => {},
  deleteComment: async () => {},
  addTagToTask: async () => {},
  removeTagFromTask: async () => {},
  createTag: async () => {},
  completeRecurringTask: async () => {},
  calculateNextDate: () => null,
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
  const [userTags, setUserTags] = useState([]);
  const [subtasksMap, setSubtasksMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const subtasksUnsubRef = useRef({});
  const commentsUnsubRef = useRef({});

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setUserTags([]);
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

  // User tags listener
  useEffect(() => {
    if (!user?.uid) return undefined;
    const unsub = subscribeToUserTags(user.uid, setUserTags);
    return () => unsub();
  }, [user?.uid]);

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
      Object.values(commentsUnsubRef.current).forEach((fn) => fn());
      commentsUnsubRef.current = {};
      setCommentsMap({});
    },
    []
  );

  // Maintain comments listeners per task (subcollection `/tasks/{id}/comments`)
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

  const tasksWithSubtasks = useMemo(
    () =>
      tasks.map((t) => ({
        ...t,
        subtasks: subtasksMap[t.id] || [],
        comments: commentsMap[t.id] || [],
      })),
    [tasks, subtasksMap, commentsMap]
  );

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

  const addTask = useCallback(
    async ({
      title,
      description = "",
      priority = "medium",
      deadline = "",
      recurring,
      tags = [],
      collaborators = [],
    }) => {
      if (!user) return null;
      const timestamp = Date.now();
      const cleanTitle = title.trim();
      const cleanId = `${cleanTitle.replace(/\s+/g, "_") || "task"}_${timestamp}`;
      const recurringData = recurring?.isRecurring
        ? {
            isRecurring: true,
            type: recurring.type || "daily",
            interval: recurring.interval || 1,
            byWeekday: recurring.byWeekday || ["mon"],
            byMonthday: recurring.byMonthday || 1,
            endDate: recurring.endDate || null,
            timezone: recurring.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            anchorTaskId: recurring.anchorTaskId || cleanId,
            autoCreateWindow: recurring.autoCreateWindow || 7,
          }
        : { isRecurring: false };
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
          recurring: recurringData,
          generatedFrom: recurring?.generatedFrom || null,
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

        // handle recurring completion -> generate next instance
        if (
          prevTask.recurring?.isRecurring &&
          updatedFields.status === "completed" &&
          prevTask.status !== "completed"
        ) {
          await completeRecurringTask(id, prevTask);
        }
      }
    },
    [recordActivity, tasks, user]
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

  const addTagToTask = useCallback(
    async (taskId, tag) => {
      if (!user || !taskId || !tag?.id) return;
      try {
        await addTagToTaskService(taskId, tag);
        await recordActivity(taskId, {
          type: "tag_added",
          to: tag.label,
        });
      } catch (err) {
        console.warn("addTagToTask error", err);
      }
    },
    [recordActivity, user]
  );

  const removeTagFromTask = useCallback(
    async (taskId, tag) => {
      if (!user || !taskId || !tag?.id) return;
      try {
        await removeTagFromTaskService(taskId, tag);
        await recordActivity(taskId, {
          type: "tag_removed",
          from: tag.label,
        });
      } catch (err) {
        console.warn("removeTagFromTask error", err);
      }
    },
    [recordActivity, user]
  );

  const createTag = useCallback(
    async ({ label, color }) => {
      if (!user?.uid) return null;
      try {
        return await createUserTag(user.uid, { label, color });
      } catch (err) {
        console.warn("createTag error", err);
        return null;
      }
    },
    [user?.uid]
  );

  const generateNextTaskInstance = useCallback(
    async (anchorTask) => {
      if (!anchorTask?.recurring?.isRecurring) return null;
      const nextDate = calculateNextDate(anchorTask.recurring, anchorTask.deadline);
      if (!nextDate) return null;

      const nextId = `${anchorTask.recurring.anchorTaskId || anchorTask.id}_${Date.now()}`;
      const basePayload = {
        ...anchorTask,
        id: nextId,
        status: "active",
        deadline: nextDate,
        createdAt: Date.now(),
        updatedAt: serverTimestamp(),
        recurring: {
          ...anchorTask.recurring,
          anchorTaskId: anchorTask.recurring.anchorTaskId || anchorTask.id,
        },
        generatedFrom: {
          anchorTaskId: anchorTask.recurring.anchorTaskId || anchorTask.id,
          recurringRule: anchorTask.recurring.type,
        },
      };

      await setDoc(doc(db, "tasks", nextId), basePayload, { merge: true });

      // clone subtasks reset to unchecked
      try {
        const subSnap = await getDocs(collection(db, "tasks", anchorTask.id, "subtasks"));
        const batch = writeBatch(db);
        subSnap.forEach((d) => {
          const data = d.data();
          const newSubId = d.id;
          batch.set(doc(db, "tasks", nextId, "subtasks", newSubId), {
            ...data,
            done: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastEditedBy: anchorTask.ownerId || user?.uid,
          });
        });
        await batch.commit();
      } catch (err) {
        console.warn("clone subtasks for next instance failed", err);
      }
      return nextId;
    },
    [user?.uid]
  );

  const completeRecurringTask = useCallback(
    async (taskId, prevTask) => {
      const task = prevTask || tasks.find((t) => t.id === taskId);
      if (!task?.recurring?.isRecurring) return;
      await updateDoc(doc(db, "tasks", taskId), { completedAt: serverTimestamp() });
      await generateNextTaskInstance(task);
    },
    [generateNextTaskInstance, tasks]
  );

  const createRecurringTask = useCallback(
    async (payload) => {
      return addTask(payload);
    },
    [addTask]
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

  const value = useMemo(
    () => ({
      tasks: tasksWithSubtasks,
      tasksByDate,
      stats,
      userTags,
      calculateNextDate,
      createRecurringTask,
      addTask,
      updateTask,
      deleteTask,
      undoDelete,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      markAllSubtasksDone,
      addComment,
      editComment,
      deleteComment,
      addTagToTask,
      removeTagFromTask,
      createTag,
      completeRecurringTask,
    }),
    [
      tasksWithSubtasks,
      tasksByDate,
      stats,
      userTags,
      calculateNextDate,
      createRecurringTask,
      addTask,
      updateTask,
      deleteTask,
      undoDelete,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      markAllSubtasksDone,
      addComment,
      editComment,
      deleteComment,
      addTagToTask,
      removeTagFromTask,
      createTag,
      completeRecurringTask,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);
