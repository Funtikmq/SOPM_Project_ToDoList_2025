import { useState, useEffect } from "react";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

import ListHead from "./ListHead";
import Task from "./Task";

import "./List.css";

const List = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const taskCollection = collection(db, "tasks");
      const taskSnapshot = await getDocs(taskCollection);

      const taskList = taskSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(taskList);
    };
    fetchTasks();
  }, []);

  return (
    <>
      <div className="listContainer">
        <h3 className="containerTitle">Lista Sarcini</h3>
        <ul className="list">
          <li className="listItem">
            <ListHead />
          </li>
          {tasks.map((task) => (
            <li className="listItem" key={task.id}>
              <Task taskData={task} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
export default List;
