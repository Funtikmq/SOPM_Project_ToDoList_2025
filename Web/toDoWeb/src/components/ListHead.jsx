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
        Status{getArrow("status")}
      </h3>
      <h3
        className="listHeadItem"
        style={headStyle}
        onClick={() => onSort("title")}
      >
        Titlu{getArrow("title")}
      </h3>
      <h3
        className="listHeadItem"
        style={headStyle}
        onClick={() => onSort("priority")}
      >
        Prioritate{getArrow("priority")}
      </h3>
      <h3
        className="listHeadItem"
        style={headStyle}
        onClick={() => onSort("deadline")}
      >
        Deadline{getArrow("deadline")}
      </h3>
    </div>
  );
};
export default ListHead;
