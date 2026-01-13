import { useState } from "react";
import List from "../components/List";
import AddTask from "../components/AddTask";
import "./TaskListPage.css";

const TaskListPage = () => {
  const [showAdd, setShowAdd] = useState(true);

  return (
    <div className="taskListPage">
      <div className={`taskListLayout ${showAdd ? "" : "taskListLayout--compact"}`}>
        <List onToggleAddTask={() => setShowAdd((prev) => !prev)} />
        {showAdd && (
          <div className="taskListAddPanel">
            <AddTask onClose={() => setShowAdd(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListPage;
