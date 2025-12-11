import "./Tag.css";

const TagPill = ({ tag, onRemove, removable = true }) => {
  if (!tag) return null;
  const color = tag.color || "#c800ff";
  return (
    <span className="tagPill" style={{ borderColor: color + "55", background: color + "22" }}>
      <span className="tagDot" style={{ background: color }} />
      <span>#{tag.label}</span>
      {removable && (
        <button
          type="button"
          className="tagRemove"
          aria-label="Remove tag"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(tag);
          }}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default TagPill;
