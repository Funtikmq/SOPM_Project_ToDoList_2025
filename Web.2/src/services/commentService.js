import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const commentsCol = (taskId) => collection(db, "tasks", taskId, "comments");

export const listenComments = (taskId, callback) => {
  if (!taskId) return () => {};
  const q = query(commentsCol(taskId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
};

export const addComment = async (taskId, { uid, username, displayName, avatarUrl, text }) => {
  if (!taskId) return null;
  return addDoc(commentsCol(taskId), {
    uid,
    username: username || "",
    displayName: displayName || "",
    avatarUrl: avatarUrl || null,
    text: text || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    edited: false,
  });
};

export const deleteComment = async (taskId, commentId) => {
  if (!taskId || !commentId) return;
  await deleteDoc(doc(db, "tasks", taskId, "comments", commentId));
};
