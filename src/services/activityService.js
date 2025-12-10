import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const logActivity = async (taskId, entry = {}) => {
  if (!taskId) return null;
  const payload = {
    taskId,
    createdAt: serverTimestamp(),
    ...entry,
  };
  try {
    return await addDoc(collection(db, "tasks", taskId, "activityLog"), payload);
  } catch (err) {
    console.warn("logActivity error", err);
    return null;
  }
};

export const subscribeToActivity = (taskId, callback) => {
  if (!taskId) return () => {};
  const q = query(collection(db, "tasks", taskId, "activityLog"), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      console.warn("subscribeToActivity error", err);
    }
  );
  return unsub;
};
