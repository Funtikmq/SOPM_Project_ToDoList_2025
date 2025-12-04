import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useTranslate } from "../translation";
import "./RecycleBin.css";

const RecycleBin = ({ open, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open || !user) return;
    const q = query(
      collection(db, "trash"),
      where("userId", "==", user.uid),
      orderBy("deletedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
    });
    return () => unsub();
  }, [open, user]);

  const handleRestore = async (item) => {
    if (!user) return;
    const { originalId, id, userId, deletedAt, ...rest } = item;
    try {
      await setDoc(doc(db, "tasks", originalId), {
        ...rest,
        id: originalId,
        userId: user.uid,
      });
      await deleteDoc(doc(db, "trash", id));
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
            {t("recycleBin")}
          </div>
          <button className="iconButton" onClick={handleClose} aria-label="Close bin">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="binEmpty">
            <div className="binIcon">🗑️</div>
            <div className="binText">{t("binEmpty")}</div>
          </div>
        ) : (
          <ul className="binList">
            {items.map((item) => (
              <li key={item.id} className="binItem">
                <div className="binInfo">
                  <div className="binTitleText">{item.title || t("noTitle")}</div>
                  <div className="binMeta">
                    {item.deadline && <span>{item.deadline}</span>}
                    <span className={`badge status-${item.status || "active"}`}>{t(item.status || "active")}</span>
                  </div>
                </div>
                <button className="restoreButton" onClick={() => handleRestore(item)}>
                  {t("restore")}
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
