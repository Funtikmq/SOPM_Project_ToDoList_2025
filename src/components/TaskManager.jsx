import Header from "./Header";
import Footer from "./Footer";
import Menu from "./Menu";

import "./TaskManager.css";

const TaskManager = () => {
  return (
    <>
      <div className="taskManagerLayout">
        <Header />
        <Menu />
        <Footer />
      </div>
    </>
  );
};
export default TaskManager;
