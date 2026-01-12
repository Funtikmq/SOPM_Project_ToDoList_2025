import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useTranslate } from "../translation";
import "./RecycleBin.css";

const RecycleBin = ({ open, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslate();
  const [items, setItems] = useState([]);
  const { restoreTask } = useTasks();

  useEffect(() => {
    if (!open || !user) return;
    const q = query(
      collection(db, "trash"),
      where("userId", "==", user.uid),
      orderBy("deletedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const payload = d.data();
        return { ...payload, docId: d.id };
      });
      const unique = [];
      const seen = new Set();
      data.forEach((entry) => {
        const key = entry.originalId || entry.id || entry.docId;
        if (seen.has(key)) return;
        seen.add(key);
        unique.push(entry);
      });
      setItems(unique);
    });
    return () => unsub();
  }, [open, user]);

  const handleRestore = async (item) => {
    if (!user) return;
    const { originalId, docId, id: _ignoredId, ...rest } = item;
    try {
      await restoreTask({
        ...rest,
        originalId,
        docId,
      });
      // remove any other duplicates of the same task in trash
      const dupQuery = query(
        collection(db, "trash"),
        where("userId", "==", user.uid),
        where("originalId", "==", originalId)
      );
      const dupSnap = await getDocs(dupQuery);
      await Promise.all(
        dupSnap.docs
          .filter((d) => d.id !== docId)
          .map((d) => deleteDoc(doc(db, "trash", d.id)))
      );
      setItems((prev) =>
        prev.filter((entry) => (entry.originalId || entry.docId) !== originalId)
      );
    } catch (err) {
      console.error("Restore error", err);
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  if (!open) return null;

  return createPortal(
    <div className="binOverlay" onClick={handleClose}>
      <div className="binCard glass" onClick={(e) => e.stopPropagation()}>
        <div className="binHeader">
          <div className="binTitle">
            <span className="binDot" />
            {t("recycle.title")}
          </div>
          <button className="iconButton" onClick={handleClose} aria-label={t("common.close")}>
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="binEmpty">
            <div className="binIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 7h14l-1 13H6L5 7Zm3-3h8l1 3H7l1-3Z"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 11v6M14 11v6"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="binText">{t("recycle.empty")}</div>
          </div>
        ) : (
          <ul className="binList">
            {items.map((item) => (
              <li key={item.docId || item.id} className="binItem">
                <div className="binInfo">
                  <div className="binTitleText">{item.title || t("tasks.noTitle")}</div>
                  <div className="binMeta">
                    {item.deadline && <span>{item.deadline}</span>}
                    <span className={`badge status-${item.status || "active"}`}>
                      {t(`status.${item.status || "active"}`)}
                    </span>
                  </div>
                </div>
                <button className="restoreButton" onClick={() => handleRestore(item)}>
                  {t("recycle.restore")}
                </button>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>,
    document.body
  );
};

export default RecycleBin;

