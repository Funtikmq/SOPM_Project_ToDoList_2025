import "./AddTask.css";

const AddTask = () => {
  return (
    <>
      <div className="taskFormContainer">
        <h3 className="containerTitle">Adauga Sarcina</h3>
        <form className="taskForm">
          <h5>Titlu</h5>
          <input type="text" className="taskInput" />
          <h5>Descriere</h5>
          <textarea
            name="description"
            className="taskInput taskText"
          ></textarea>
          <h5>Prioritate</h5>
          <select name="priority" className="taskInput">
            <option value="high">Mare</option>
            <option value="medium">Medie</option>
            <option value="low">Mica</option>
          </select>
          <h5>Deadline</h5>
          <input type="text" className="taskInput" />
          <input type="submit" className="taskSubmit" value="Save" />
        </form>
      </div>
    </>
  );
};
export default AddTask;
