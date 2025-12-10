import { useEffect, useMemo, useRef, useState } from "react";
import "./Tag.css";

const TagSelector = ({ userTags = [], existingTagIds = [], onSelectTag, onCreateTag, onClose, t }) => {
  const [search, setSearch] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#c800ff");
  const wrapperRef = useRef(null);

  const filtered = useMemo(() => {
    return userTags
      .filter((tag) => !existingTagIds.includes(tag.id))
      .filter((tag) => tag.label.toLowerCase().includes(search.toLowerCase()));
  }, [existingTagIds, search, userTags]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapperRef.current?.contains(e.target)) return;
      onClose?.();
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [onClose]);

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    const created = await onCreateTag?.(newLabel.trim(), newColor);
    if (created) {
      setNewLabel("");
      setNewColor("#c800ff");
    }
  };

  return (
    <div className="tagSelector" ref={wrapperRef}>
      <div className="tagSelectorHeader">
        <input
          className="tagSearchInput"
          placeholder={t ? t("search") : "Search tags"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="tagList">
        {filtered.length === 0 ? (
          <div className="tagEmpty">{t ? t("noTags") : "No tags yet"}</div>
        ) : (
          filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="tagListItem"
              onClick={() => onSelectTag?.(tag)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="tagDot" style={{ background: tag.color || "#c800ff" }} />
                <span>#{tag.label}</span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="tagCreateRow">
        <input
          className="tagNewInput"
          placeholder={t ? t("addTag") : "New tag"}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <input
          className="tagColorInput"
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          title={t ? t("color") : "Color"}
        />
        <button className="tagCreateBtn" type="button" onClick={handleCreate}>
          {t ? t("add") : "Add"}
        </button>
      </div>
    </div>
  );
};

export default TagSelector;
