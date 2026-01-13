import { useState } from "react";
import List from "./List";
import AddTask from "./AddTask";
import "./Menu.css";

const Menu = () => {
  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <div className="MenuLayout" data-panel={showAddTask ? "open" : "closed"}>
      <div className="menuContent">
        <List onToggleAddTask={() => setShowAddTask((prev) => !prev)} />
      </div>
      <aside className={`menuPanel ${showAddTask ? "open" : ""}`}>
        <AddTask onClose={() => setShowAddTask(false)} />
      </aside>
      {showAddTask && (
        <button
          type="button"
          className="menuPanelBackdrop"
          aria-label="Close add task"
          onClick={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
};

export default Menu;
