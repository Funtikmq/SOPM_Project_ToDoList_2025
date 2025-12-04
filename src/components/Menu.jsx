import { useState } from "react";
import List from "./List";
import AddTask from "./AddTask";
import "./Menu.css";

const Menu = () => {
  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <>
      <div className={`MenuLayout ${showAddTask ? "" : "single"}`}>
        <List onToggleAddTask={() => setShowAddTask(!showAddTask)} />
        <div style={{ display: showAddTask ? "block" : "none" }}>
          <AddTask />
        </div>
      </div>
    </>
  );
};

export default Menu;
