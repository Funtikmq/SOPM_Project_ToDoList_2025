import "./Task.css";

const Task = ({ taskData }) => {
  console.log(taskData);

  const deadline = taskData.deadline?.toDate().toLocaleDateString();
  return (
    <>
      <div className="task">
        <div className="taskItem">
          <h3 className="taskStatus">{taskData.status}</h3>
        </div>
        <div className="taskItem">
          <h3 className="taskTitle">{taskData.title}</h3>
        </div>
        <div className="taskItem">
          <h3 className="taskPriority">{taskData.priority}</h3>
        </div>
        <div className="taskItem">
          <h3 className="taskDeadline">{deadline}</h3>
        </div>
      </div>
    </>
  );
};
export default Task;
