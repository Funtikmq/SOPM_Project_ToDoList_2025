/* eslint-disable react-refresh/only-export-components */
export const translations = {
  ro: {
    // List
    taskList: "Lista Sarcini",
    status: "Status",
    title: "Titlu",
    priority: "Prioritate",
    deadline: "Deadline",
    addNewTask: "Adaugă sarcină nouă",
    all: "Toate",
    untilDate: "Până la",

    // Status
    upcoming: "Viitoare",
    active: "Activă",
    completed: "Finalizată",
    overdue: "Întârziată",
    canceled: "Anulată",

    // Priority
    high: "Mare",
    medium: "Medie",
    low: "Mică",

    // AddTask
    addTask: "Adaugă Sarcină",
    description: "Descriere",
    save: "Salvează",
    fillRequired: "Completează titlul și deadline-ul!",
    taskSaved: "Task salvat!",
    taskDeleted: "Task șters.",
    undo: "Anulează",
    subtasks: "Subtask-uri",
    addSubtask: "Adaugă subtask",
    subtaskPlaceholder: "Nume subtask",
    progress: "Progres",
    markAllDone: "Finalizează tot",

    // Task
    modify: "Modifică",
    descriptionLabel: "Descriere:",
    noTasks: "Nu ai sarcini încă. Creează prima sarcină pentru a începe.",
    recycleBin: "Coș reciclare",
    restore: "Restaurează",
    binEmpty: "Coșul e gol. Nimic de restaurat.",
    noTitle: "Fără titlu",
  },
  en: {
    // List
    taskList: "Task List",
    status: "Status",
    title: "Title",
    priority: "Priority",
    deadline: "Deadline",
    addNewTask: "Add new task",
    all: "All",
    untilDate: "Until",

    // Status
    upcoming: "Upcoming",
    active: "Active",
    completed: "Completed",
    overdue: "Overdue",
    canceled: "Canceled",

    // Priority
    high: "High",
    medium: "Medium",
    low: "Low",

    // AddTask
    addTask: "Add Task",
    description: "Description",
    save: "Save",
    fillRequired: "Please fill in title and deadline!",
    taskSaved: "Task saved!",
    taskDeleted: "Task deleted.",
    undo: "Undo",
    subtasks: "Subtasks",
    addSubtask: "Add subtask",
    subtaskPlaceholder: "Subtask name",
    progress: "Progress",
    markAllDone: "Mark all done",

    // Task
    modify: "Modify",
    descriptionLabel: "Description:",
    noTasks: "No tasks yet. Add one to get started!",
    recycleBin: "Recycle Bin",
    restore: "Restore",
    binEmpty: "Bin is empty. Nothing to restore.",
    noTitle: "No title",
  },
};

export const useTranslate = () => {
  const lang = localStorage.getItem("language") || "ro";

  const t = (key) => translations[lang]?.[key] || key;

  return { t, lang };
};
