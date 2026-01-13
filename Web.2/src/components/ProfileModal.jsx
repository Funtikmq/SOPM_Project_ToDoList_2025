import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useTranslate } from "../translation";
import "./ShareTaskModal.css";

const ProfileModal = ({ open, onClose, user, onUpdated }) => {
  const { t } = useTranslate();
  const [username, setUsername] = useState(user?.username || "");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUsername(user?.username || "");
      setDisplayName(user?.displayName || "");
      setError("");
    }
  }, [open, user]);

  if (!open) return null;

  const handleSave = async () => {
    if (!user) return;
    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplay = displayName.trim();

    if (!/^[a-zA-Z0-9_]{3,}$/.test(cleanUsername)) {
      setError(t("settings.usernameInvalid"));
      return;
    }

    setSaving(true);
    setError("");
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("username", "==", cleanUsername))
      );
      const taken = snap.docs.some((d) => d.id !== user.uid);
      if (taken) {
        setError(t("settings.usernameTaken"));
        setSaving(false);
        return;
      }

      const finalDisplay =
        cleanDisplay || user.displayName || user.email || cleanUsername;
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          username: cleanUsername,
          tag: `#${cleanUsername}`,
          displayName: finalDisplay,
          avatarUrl: user.avatarUrl || null,
        },
        { merge: true }
      );
      if (auth.currentUser && auth.currentUser.displayName !== finalDisplay) {
        await updateProfile(auth.currentUser, { displayName: finalDisplay });
      }
      try {
        const sharedSnap = await getDocs(
          query(collection(db, "tasks"), where("participants", "array-contains", user.uid))
        );
        const updates = [];
        sharedSnap.forEach((d) => {
          const data = d.data();
          const collabs = Array.isArray(data.collaborators) ? data.collaborators : [];
          const updatedCollabs = collabs.map((c) =>
            c.uid === user.uid ? { ...c, username: cleanUsername, displayName: finalDisplay } : c
          );
          const patch = {};
          let changed = false;
          if (data.ownerId === user.uid) {
            patch.ownerUsername = cleanUsername;
            patch.ownerName = finalDisplay;
            changed = true;
          }
          if (JSON.stringify(collabs) !== JSON.stringify(updatedCollabs)) {
            patch.collaborators = updatedCollabs;
            patch.shared =
              typeof data.shared === "boolean"
                ? data.shared
                : updatedCollabs.length > 0;
            changed = true;
          }
          if (changed) {
            updates.push(updateDoc(doc(db, "tasks", d.id), patch));
          }
        });
        if (updates.length) await Promise.all(updates);
      } catch (err) {
        console.error("collaborator sync error", err);
      }
      onUpdated?.();
      onClose?.();
    } catch (err) {
      console.error("profile save error", err);
      setError(t("errors.saveProfile"));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard profileCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{t("settings.profileTitle")}</div>
            <div className="modalSubtitle">{t("settings.subtitle")}</div>
          </div>
          <button className="modalCloseBtn" onClick={onClose} aria-label={t("common.close")}>
            ×
          </button>
        </div>

        <div className="profileForm">
          <label className="profileLabel">{t("settings.displayName")}</label>
          <input
            className="shareInput"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("settings.displayNamePlaceholder")}
          />

          <label className="profileLabel">{t("settings.username")}</label>
          <div className="profileRow">
            <span className="profileTagPrefix">#</span>
            <input
              className="shareInput"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("settings.usernamePlaceholder")}
            />
          </div>
          <div className="profileHint">{t("settings.usernameHint")}</div>
        </div>

        {error && <div className="shareError">{error}</div>}

        <div className="profileActions">
          <button className="removeCollabBtn ghost" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button className="saveProfileBtn" onClick={handleSave} disabled={saving}>
            {saving ? t("common.loading") : t("settings.save")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileModal;
