import { useState } from "react";
import List from "./List";
import AddTask from "./AddTask";
import "./Menu.css";

const Menu = () => {
  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <>
      <div className={`MenuLayout ${showAddTask ? "hasAdd" : "single"}`}>
        <List onToggleAddTask={() => setShowAddTask(!showAddTask)} />
        <div className={`addTaskPanel ${showAddTask ? "is-visible" : ""}`}>
          <AddTask />
        </div>
      </div>
    </>
  );
};

export default Menu;
