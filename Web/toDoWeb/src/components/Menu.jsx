import List from "./List";
import AddTask from "./AddTask";
import "./Menu.css";

const Menu = () => {
  return (
    <>
      <div className="MenuLayout">
        <List />
        <AddTask />
      </div>
    </>
  );
};
export default Menu;
