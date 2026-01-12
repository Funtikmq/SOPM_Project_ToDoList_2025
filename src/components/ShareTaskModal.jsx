import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import Dropdown from "./ui/Dropdown";
import { useTranslate } from "../translation";
import { useTasks } from "../context/TaskContext";
import "./ShareTaskModal.css";

const ShareTaskModal = ({ open, onClose, taskId, initialTask, currentUser, canManage }) => {
  const { t } = useTranslate();
  const { getTask, updateTask, getPermissions } = useTasks();
  const [task, setTask] = useState(initialTask || null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const taskFromContext = getTask(taskId);
  const perms = getPermissions(taskId);

  const roleOptions = useMemo(
    () => [
      { value: "viewer", label: t("collaborators.viewer") },
      { value: "editor", label: t("collaborators.editor") },
    ],
    [t]
  );

  useEffect(() => {
    if (!open) return;
    if (taskFromContext) {
      setTask(taskFromContext);
    } else if (initialTask) {
      setTask(initialTask);
    }
  }, [open, taskFromContext, initialTask]);

  useEffect(() => {
    if (!task?.ownerId) return;
    const fetchOwner = async () => {
      try {
        const snap = await getDoc(doc(db, "users", task.ownerId));
        if (snap.exists()) setOwnerProfile(snap.data());
      } catch (err) {
        console.error("owner profile load error", err);
      }
    };
    fetchOwner();
  }, [task?.ownerId]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([]);
      setError("");
    }
  }, [open]);

  const collaboratorList = useMemo(() => {
    if (!task) return [];
    const ownerName =
      ownerProfile?.displayName ||
      task.ownerName ||
      ownerProfile?.username ||
      task.ownerUsername ||
      t("collaborators.owner");
    const ownerUsername =
      ownerProfile?.username ||
      task.ownerUsername ||
      (task.ownerId ? `user-${task.ownerId.slice(0, 4)}` : "owner");
    const ownerEntry = {
      uid: task.ownerId,
      displayName: ownerName,
      username: ownerUsername,
      role: "owner",
      isOwner: true,
    };
    const collabs = Array.isArray(task.collaborators) ? task.collaborators : [];
    return [ownerEntry, ...collabs.map((c) => ({ ...c, role: c.role || "viewer" }))];
  }, [task, ownerProfile]);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (!task) {
      setResults([]);
      return;
    }
    const clean = value.replace("#", "").trim().toLowerCase();
    if (!clean) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users"),
          where("username", ">=", clean),
          where("username", "<=", `${clean}\uf8ff`)
        )
      );
      const participants = Array.isArray(task?.participants)
        ? task.participants
        : task?.ownerId
          ? [task.ownerId]
          : [];
      const list = snap.docs
        .map((d) => d.data())
        .filter(
          (u) =>
            u.uid !== currentUser?.uid &&
            u.uid !== task?.ownerId &&
            !participants.includes(u.uid)
        );
      setResults(list);
    } catch (err) {
      console.error("user search error", err);
    } finally {
      setSearching(false);
    }
  };

  const addCollaborator = async (profile) => {
    if (!task || !(canManage || perms.canManageCollaborators)) return;
    if (profile.uid === currentUser?.uid) {
      setError(t("collaborators.cannotAddSelf"));
      return;
    }
    if (profile.uid === task.ownerId) {
      setError(t("collaborators.alreadyCollaborator"));
      return;
    }
    const participants = Array.isArray(task.participants)
      ? task.participants
      : task.ownerId
        ? [task.ownerId]
        : [];
    if (participants.includes(profile.uid)) {
      setError(t("collaborators.alreadyCollaborator"));
      return;
    }
    setError("");
    const collabs = Array.isArray(task.collaborators) ? task.collaborators : [];
    const nextCollabs = [
      ...collabs,
      {
        uid: profile.uid,
        role: "viewer",
        username: profile.username,
        displayName: profile.displayName || profile.email || profile.username,
      },
    ];
    const nextParticipants = [...participants, profile.uid];
    await updateTask(task.id, {
      collaborators: nextCollabs,
      participants: nextParticipants,
      shared: true,
    });
    setResults([]);
    setSearchTerm("");
  };

  const changeRole = async (uid, role) => {
    if (!task || !(canManage || perms.canManageCollaborators)) return;
    const collabs = Array.isArray(task.collaborators) ? task.collaborators : [];
    const next = collabs.map((c) => (c.uid === uid ? { ...c, role } : c));
    await updateTask(task.id, { collaborators: next });
  };

  const removeCollaborator = async (uid) => {
    if (!task || !(canManage || perms.canManageCollaborators)) return;
    const nextCollabs = (task.collaborators || []).filter((c) => c.uid !== uid);
    const nextParticipants = (task.participants || []).filter((p) => p !== uid);
    await updateTask(task.id, {
      collaborators: nextCollabs,
      participants: nextParticipants,
      shared: nextCollabs.length > 0,
    });
    if (uid === currentUser?.uid) {
      onClose?.();
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard shareCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{t("share.title")}</div>
            <div className="modalSubtitle">{t("share.subtitle")}</div>
          </div>
          <button className="modalCloseBtn" onClick={onClose} aria-label={t("common.close")}>
            ×
          </button>
        </div>

        <div className="shareSearch">
          <input
            className="shareInput"
            placeholder={t("share.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={!canManage}
          />
          {searching && <span className="shareHint">{t("share.searching")}</span>}
        </div>
        {error && <div className="shareError">{error}</div>}
        {canManage && results.length > 0 && (
          <div className="shareResults">
            {results.map((u) => (
              <button
                key={u.uid}
                className="shareResultRow"
                onClick={() => addCollaborator(u)}
              >
                <div className="shareAvatar">{(u.username || u.displayName || "?")[0]?.toUpperCase()}</div>
                <div className="shareResultMeta">
                  <div className="shareResultName">#{u.username}</div>
                  <div className="shareResultInfo">{u.displayName || u.email}</div>
                </div>
                <span className="shareAddChip">{t("share.add")}</span>
              </button>
            ))}
          </div>
        )}

          <div className="collabListHeader">
            <div className="collabListTitle">
            {t("collaborators.title")} ({Math.max(collaboratorList.length - 1, 0)})
            </div>
            <div className="collabListHint">
            {canManage ? t("share.changesSaved") : t("share.viewOnly")}
            </div>
          </div>

        <div className="collabList">
          {collaboratorList.map((c) => (
            <div key={c.uid} className="collabRow">
              <div className="collabInfo">
                <div className="collabAvatar">{(c.username || c.displayName || "?")[0]?.toUpperCase()}</div>
                <div>
                  <div className="collabName">
                    #{c.username}
                    {c.isOwner && <span className="ownerPill">{t("collaborators.owner")}</span>}
                  </div>
                  <div className="collabDisplay">{c.displayName}</div>
                </div>
              </div>
              <div className="collabActions">
                {c.isOwner ? (
                  <span className="rolePill">{t("collaborators.owner")}</span>
                ) : (
                  <Dropdown
                    value={c.role || "viewer"}
                    options={roleOptions}
                    onChange={(val) => changeRole(c.uid, val)}
                    disabled={!canManage}
                    variant="priority"
                  />
                )}
                {!c.isOwner && canManage && (
                  <button
                    className="removeCollabBtn"
                    onClick={() => removeCollaborator(c.uid)}
                  >
                    {t("collaborators.remove")}
                  </button>
                )}
              </div>
            </div>
          ))}
          {collaboratorList.length === 0 && (
            <div className="collabEmpty">{t("collaborators.empty") || "No collaborators yet."}</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareTaskModal;
