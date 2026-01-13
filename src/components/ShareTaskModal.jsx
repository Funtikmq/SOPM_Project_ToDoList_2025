import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useTranslate } from "../translation";
import Dropdown from "./ui/Dropdown";
import "./ShareTaskModal.css";
import { logActivity } from "../services/activityService";

const ROLE_OPTIONS = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
];

const roleLabel = (role) => {
  const found = ROLE_OPTIONS.find((opt) => opt.value === role);
  return found ? found.label : "Viewer";
};

const ShareTaskModal = ({ open, onClose, taskId, initialTask, currentUser, canManage }) => {
  const { t } = useTranslate();
  const [task, setTask] = useState(initialTask || null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const actorName = currentUser?.username || currentUser?.displayName || currentUser?.email || "user";

  useEffect(() => {
    if (!open || !taskId) return undefined;
    const unsub = onSnapshot(doc(db, "tasks", taskId), (snap) => {
      if (!snap.exists()) {
        onClose?.();
        return;
      }
      setTask({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [open, taskId, onClose]);

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
      "Owner";
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
    if (!task || !canManage) return;
    if (profile.uid === currentUser?.uid) {
      setError("You cannot add yourself.");
      return;
    }
    if (profile.uid === task.ownerId) {
      setError("This user already owns the task.");
      return;
    }
    const participants = Array.isArray(task.participants)
      ? task.participants
      : task.ownerId
        ? [task.ownerId]
        : [];
    if (participants.includes(profile.uid)) {
      setError("Already a collaborator.");
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
    await updateDoc(doc(db, "tasks", task.id), {
      collaborators: nextCollabs,
      participants: nextParticipants,
      shared: true,
    });
    await logActivity(task.id, {
      type: "collaborator_added",
      actorUid: currentUser?.uid,
      actorName,
      to: profile.username || profile.displayName || profile.email || profile.uid,
    });
    setResults([]);
    setSearchTerm("");
  };

  const changeRole = async (uid, role) => {
    if (!task || !canManage) return;
    const collabs = Array.isArray(task.collaborators) ? task.collaborators : [];
    const next = collabs.map((c) => (c.uid === uid ? { ...c, role } : c));
    await updateDoc(doc(db, "tasks", task.id), { collaborators: next });
    const changedUser = collabs.find((c) => c.uid === uid);
    await logActivity(task.id, {
      type: "collaborator_role_changed",
      actorUid: currentUser?.uid,
      actorName,
      from: changedUser?.role || null,
      to: role,
      extra: changedUser?.username || uid,
    });
  };

  const removeCollaborator = async (uid) => {
    if (!task || !canManage) return;
    const nextCollabs = (task.collaborators || []).filter((c) => c.uid !== uid);
    const nextParticipants = (task.participants || []).filter((p) => p !== uid);
    await updateDoc(doc(db, "tasks", task.id), {
      collaborators: nextCollabs,
      participants: nextParticipants,
      shared: nextCollabs.length > 0,
    });
    await logActivity(task.id, {
      type: "collaborator_removed",
      actorUid: currentUser?.uid,
      actorName,
      from: uid,
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
            <div className="modalTitle">Share task</div>
            <div className="modalSubtitle">Invite teammates by username and set permissions</div>
          </div>
          <button className="modalCloseBtn" onClick={onClose} aria-label="Close share modal">
            ×
          </button>
        </div>

        <div className="shareSearch">
          <input
            className="shareInput"
            placeholder={t ? t("searchCollaborators") : "Search collaborators… (#username)"}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={!canManage}
          />
          {searching && <span className="shareHint">{t ? t("searching") : "Searching…"}</span>}
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
                <span className="shareAddChip">Add</span>
              </button>
            ))}
          </div>
        )}

        <div className="collabListHeader">
          <div className="collabListTitle">
            Collaborators ({Math.max(collaboratorList.length - 1, 0)})
          </div>
          <div className="collabListHint">
            {canManage ? "Changes are saved instantly" : "View only"}
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
                    {c.isOwner ? (
                      <span className="ownerPill">Owner</span>
                    ) : (
                      <span className="rolePill">{roleLabel(c.role || "viewer")}</span>
                    )}
                  </div>
                  <div className="collabDisplay">{c.displayName}</div>
                </div>
              </div>
              <div className="collabActions">
                {c.isOwner ? (
                  <span className="rolePill">Owner</span>
                ) : (
                  <Dropdown
                    value={c.role || "viewer"}
                    options={ROLE_OPTIONS}
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
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          {collaboratorList.length === 0 && (
            <div className="collabEmpty">No collaborators yet.</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareTaskModal;
