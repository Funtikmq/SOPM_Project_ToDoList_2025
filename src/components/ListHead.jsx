import { useTranslate } from "../translation";
  const { t } = useTranslate();

const ListHead = ({ onSort, sortConfig }) => {
  const getArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  const headStyle = { cursor: "pointer" };

  return (
    <div className="listHead">
      <h3
        className="listHeadItem"
        style={headStyle}
        onClick={() => onSort("status")}
      >
        {t("status")}{getArrow("status")}
      </h3>
      <h3
        className="listHeadItem"
        style={headStyle}
        onClick={() => onSort("title")}
      >
        {t("title")}{getArrow("title")}
      </h3>
      <h3
        className="listHeadItem"
        style={headStyle}
        onClick={() => onSort("priority")}
      >
        {t("priority")}{getArrow("priority")}
      </h3>
      <h3
        className="listHeadItem"
        style={headStyle}
        onClick={() => onSort("deadline")}
      >
        {t("deadline")}{getArrow("deadline")}
      </h3>
    </div>
  );
};
export default ListHead;
