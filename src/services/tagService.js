import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const subscribeToUserTags = (userId, callback) => {
  if (!userId) return () => {};
  const col = collection(db, "users", userId, "tags");
  return onSnapshot(col, (snap) => {
    const tags = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(tags);
  });
};

export const createUserTag = async (userId, { label, color }) => {
  if (!userId) return null;
  const cleanLabel = (label || "").trim();
  const cleanColor = color || "#c800ff";
  if (!cleanLabel) return null;
  const docRef = await addDoc(collection(db, "users", userId, "tags"), {
    label: cleanLabel,
    color: cleanColor,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, label: cleanLabel, color: cleanColor };
};

export const addTagToTask = async (taskId, tag) => {
  if (!taskId || !tag?.id) return;
  const tagData = { id: tag.id, label: tag.label, color: tag.color };
  await updateDoc(doc(db, "tasks", taskId), {
    tags: arrayUnion(tagData),
  });
};

export const removeTagFromTask = async (taskId, tag) => {
  if (!taskId || !tag?.id) return;
  const tagData = { id: tag.id, label: tag.label, color: tag.color };
  await updateDoc(doc(db, "tasks", taskId), {
    tags: arrayRemove(tagData),
  });
};
