import { useMemo, useRef, useState } from "react";

const CommentsSection = ({
  comments = [],
  canComment = false,
  allowModeration = false,
  currentUserId = null,
  commentText = "",
  editingCommentId = null,
  onCommentTextChange,
  onSubmit,
  onCancelEdit,
  onStartEdit,
  onDelete,
  t,
}) => {
  const [open, setOpen] = useState(true);
  const fileInputRef = useRef(null);
  const badge = useMemo(() => comments.length || 0, [comments.length]);

  return (
    <div className="commentsShell">
      <button
        type="button"
        className="commentsHeaderModern"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="commentsHeaderLeft">
          <span className="commentsTitleText">{t ? t("comments") : "Comments"}</span>
          <span className="commentsBadge">{badge}</span>
        </div>
        <div className={`commentsChevron ${open ? "open" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      <div className={`commentsBody ${open ? "open" : ""}`}>
        <div className="commentsListModern">
          {comments.length === 0 ? (
            <div className="commentEmpty">{t ? t("noComments") : "No comments yet"}</div>
          ) : (
            comments.map((c) => {
              const ts = c.updatedAt?.toDate?.() || c.createdAt?.toDate?.();
              const label = ts ? ts.toLocaleString() : "";
              const initial = (c.authorUsername || c.username || c.authorName || "U")[0]?.toUpperCase();
              const canModerate = allowModeration || c.authorId === currentUserId;
              return (
                <div key={c.id} className="commentCard">
                  <div className="commentAvatar">{initial}</div>
                  <div className="commentBody">
                    <div className="commentMeta">
                      <span className="commentAuthor">{c.authorName || c.username || c.authorUsername || "User"}</span>
                      <span className="commentTime">{label}</span>
                      {c.edited && <span className="commentEdited">{t ? t("edited") : "edited"}</span>}
                    </div>
                    <div className="commentText">{c.text}</div>
                    {Array.isArray(c.attachments) && c.attachments.length > 0 && (
                      <div className="commentAttachments">
                        {c.attachments.map((att) => {
                          const url = att?.url || att?.downloadURL || att?.href;
                          if (!url) return null;
                          const name = att?.name || att?.fileName || att?.type || "file";
                          const isImage =
                            att?.type?.startsWith("image/") ||
                            (typeof url === "string" && /\.(png|jpe?g|gif|webp|svg)$/i.test(url));
                          return (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className={`commentAttachment ${isImage ? "withPreview" : ""}`}
                            >
                              {isImage && (
                                <span className="commentAttachmentThumb">
                                  <img src={url} alt={name || "attachment"} />
                                </span>
                              )}
                              <span className="commentAttachmentLabel">{name}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                    {canModerate && (
                      <div className="commentActions">
                        <button type="button" onClick={() => onStartEdit?.(c)}>
                          {t ? t("edit") : "Edit"}
                        </button>
                        <button type="button" onClick={() => onDelete?.(c.id)}>
                          {t ? t("delete") : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {canComment && (
          <div className="commentComposerBox">
            <div className="commentInputRow">
              <textarea
                className="commentModernTextarea"
                value={commentText}
                onChange={(e) => onCommentTextChange?.(e.target.value)}
                placeholder={t ? t("addComment") : "Add a comment..."}
              />
              <button
                type="button"
                className="commentSendBtn"
                onClick={onSubmit}
                disabled={!commentText.trim()}
              >
                {editingCommentId ? (t ? t("save") : "Save") : t ? t("post") : "Post"}
              </button>
            </div>

            {editingCommentId && (
              <div className="commentComposerFooter">
                <button type="button" className="commentCancel" onClick={onCancelEdit}>
                  {t ? t("cancel") : "Cancel"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
