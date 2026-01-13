import { useState } from "react";

export const formatDateKey = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const useCalendarDrag = ({ onDrop }) => {
  const [draggingId, setDraggingId] = useState(null);

  const handleDragStart = (task) => (e) => {
    setDraggingId(task.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (dateKey) => async (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggingId;
    if (!taskId || !dateKey) {
      setDraggingId(null);
      return;
    }
    await onDrop?.(taskId, dateKey);
    setDraggingId(null);
  };

  return {
    draggingId,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
};

export default useCalendarDrag;
