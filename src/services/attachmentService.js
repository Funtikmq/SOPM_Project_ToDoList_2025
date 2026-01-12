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

const attachmentsCol = (taskId) => collection(db, "tasks", taskId, "attachments");

export const listenAttachments = (taskId, callback) => {
  if (!taskId) return () => {};
  const q = query(attachmentsCol(taskId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
};

export const addAttachment = async (taskId, { name, size, contentType, url, storagePath, uid }) => {
  if (!taskId) return null;
  return addDoc(attachmentsCol(taskId), {
    name,
    size: size || 0,
    contentType: contentType || "",
    url: url || "",
    storagePath: storagePath || "",
    uid: uid || "",
    createdAt: serverTimestamp(),
  });
};

export const deleteAttachment = async (taskId, attachmentId) => {
  if (!taskId || !attachmentId) return;
  await deleteDoc(doc(db, "tasks", taskId, "attachments", attachmentId));
};
