// Task schema helpers for FAZA 2 (no integration yet)
// This module defines the normalized task shape, utility functions,
// and basic CRUD helpers to keep backward compatibility.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const ROLE_OWNER = "owner";
const ROLE_EDITOR = "editor";
const ROLE_VIEWER = "viewer";

const DEFAULT_TIME_TRACKING = { totalSeconds: 0 };

export const buildDefaultTaskFields = () => ({
  participants: [],
  collaborators: [],
  shared: false,
  tags: [],
  attachmentsCount: 0,
  commentsCount: 0,
  activityCount: 0,
  timeTracking: { ...DEFAULT_TIME_TRACKING },
  kanbanColumn: null,
  reminders: [],
  archived: false,
  updatedAt: null,
});

export const normalizeTask = (task = {}, fallbackOwnerId) => {
  const ownerId = task.ownerId || task.userId || fallbackOwnerId || null;
  const participants =
    Array.isArray(task.participants) && task.participants.length
      ? task.participants
      : ownerId
      ? [ownerId]
      : [];
  const collaborators = Array.isArray(task.collaborators)
    ? task.collaborators
    : [];
  const shared =
    typeof task.shared === "boolean"
      ? task.shared
      : collaborators.length > 0 || participants.length > 1;

  return {
    ...buildDefaultTaskFields(),
    ...task,
    ownerId,
    participants,
    collaborators,
    shared,
    timeTracking: task.timeTracking || { ...DEFAULT_TIME_TRACKING },
    attachmentsCount:
      typeof task.attachmentsCount === "number" ? task.attachmentsCount : 0,
    commentsCount:
      typeof task.commentsCount === "number" ? task.commentsCount : 0,
    activityCount:
      typeof task.activityCount === "number" ? task.activityCount : 0,
    tags: Array.isArray(task.tags) ? task.tags : [],
    reminders: Array.isArray(task.reminders) ? task.reminders : [],
    kanbanColumn: task.kanbanColumn || null,
    updatedAt: task.updatedAt || null,
  };
};

export const roles = {
  OWNER: ROLE_OWNER,
  EDITOR: ROLE_EDITOR,
  VIEWER: ROLE_VIEWER,
};

export const canEdit = (task, uid) => {
  if (!task || !uid) return false;
  if (task.ownerId === uid) return true;
  const collab = (task.collaborators || []).find((c) => c.uid === uid);
  return collab
    ? collab.role === ROLE_EDITOR || collab.role === ROLE_OWNER
    : false;
};

export const canDelete = (task, uid) => task?.ownerId === uid;

export const canManageCollaborators = (task, uid) => task?.ownerId === uid;

export const isParticipant = (task, uid) =>
  !!uid && Array.isArray(task?.participants) && task.participants.includes(uid);

// Firestore helpers (not yet wired to UI)
const tasksCol = collection(db, "tasks");
const trashCol = collection(db, "trash");

export const listenTasksForUser = (uid, callback) => {
  if (!uid) return () => {};
  const q = query(
    tasksCol,
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) =>
      normalizeTask({ id: d.id, ...d.data() }, uid)
    );
    callback(list);
  });
};

export const createTask = async (task) => {
  const base = normalizeTask(task, task.ownerId);
  const id = base.id || base.customId;
  const payload = {
    ...base,
    id: id || undefined,
    createdAt: base.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (id) {
    await setDoc(doc(db, "tasks", id), payload, { merge: true });
    return id;
  }
  const ref = await addDoc(tasksCol, payload);
  await updateDoc(ref, { id: ref.id });
  return ref.id;
};

export const updateTask = async (taskId, patch) => {
  if (!taskId) return;
  await updateDoc(doc(db, "tasks", taskId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
};

export const softDeleteTask = async (task) => {
  if (!task?.id) return;
  const { id, ...rest } = task;
  const trashRef = await addDoc(trashCol, {
    ...rest,
    originalId: id,
    deletedAt: serverTimestamp(),
  });
  await deleteDoc(doc(db, "tasks", id));
  return trashRef.id;
};

export const restoreFromTrash = async (trashDoc) => {
  if (!trashDoc) return;
  const { originalId, id: fallbackId, docId, ...rest } = trashDoc;
  const targetId = originalId || rest.id || fallbackId || docId;
  const trashId = docId || fallbackId || originalId;
  if (!targetId) return;
  await setDoc(
    doc(db, "tasks", targetId),
    {
      ...rest,
      id: targetId,
      ownerId: rest.ownerId || rest.userId || null,
      userId: rest.ownerId || rest.userId || null,
      participants:
        Array.isArray(rest.participants) && rest.participants.length
          ? rest.participants
          : rest.ownerId
          ? [rest.ownerId]
          : [],
      collaborators: Array.isArray(rest.collaborators)
        ? rest.collaborators
        : [],
      shared:
        typeof rest.shared === "boolean"
          ? rest.shared
          : Array.isArray(rest.collaborators) && rest.collaborators.length > 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  if (trashId) {
    await deleteDoc(doc(db, "trash", trashId));
  }
  return targetId;
};

export const batchUpdateDates = async (updates = []) => {
  if (!Array.isArray(updates) || !updates.length) return;
  const batch = writeBatch(db);
  updates.forEach(({ id, deadline, dueDate }) => {
    if (!id) return;
    const ref = doc(db, "tasks", id);
    const payload = {
      updatedAt: serverTimestamp(),
    };
    if (deadline !== undefined) payload.deadline = deadline;
    if (dueDate !== undefined) payload.dueDate = dueDate;
    batch.update(ref, payload);
  });
  await batch.commit();
};

export const migrateLegacyTasks = async (uid) => {
  if (!uid) return;
  const snap = await getDocs(query(tasksCol, where("userId", "==", uid)));
  const ops = [];
  snap.forEach((d) => {
    const normalized = normalizeTask({ id: d.id, ...d.data() }, uid);
    ops.push(
      setDoc(
        doc(db, "tasks", d.id),
        {
          participants: normalized.participants,
          collaborators: normalized.collaborators,
          shared: normalized.shared,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    );
  });
  if (ops.length) await Promise.all(ops);
};
