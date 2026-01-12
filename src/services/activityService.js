import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const activityCol = (taskId) => collection(db, "tasks", taskId, "activity");

export const listenActivity = (taskId, callback, limitSize) => {
  if (!taskId) return () => {};
  const args = [activityCol(taskId), orderBy("createdAt", "desc")];
  if (limitSize) args.push(limit(limitSize));
  const q = query(...args);
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
};

export const logActivity = async (taskId, { type, byUid, byName, payload }) => {
  if (!taskId) return null;
  return addDoc(activityCol(taskId), {
    type,
    byUid,
    byName,
    payload: payload || {},
    createdAt: serverTimestamp(),
  });
};
