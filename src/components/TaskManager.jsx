import Header from "./Header";
import Footer from "./Footer";
import Menu from "./Menu";
import StatsBar from "./StatsBar";

import "./TaskManager.css";

const TaskManager = () => {
  return (
    <div className="taskManagerLayout app-shell">
      <Header />
      <StatsBar />
      <main className="workspace">
        <Menu />
      </main>
      <Footer />
    </div>
  );
};
export default TaskManager;
