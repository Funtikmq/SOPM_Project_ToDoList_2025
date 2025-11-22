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
    untilDate: "Până în",
    
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
    
    // Task
    modify: "Modifică",
    descriptionLabel: "Descriere:",
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
    
    // Task
    modify: "Modify",
    descriptionLabel: "Description:",
  }
};

// Funcție simplă pentru a obține traducerea
export const useTranslate = () => {
  const lang = localStorage.getItem("language") || "ro";
  
  const t = (key) => {
    return translations[lang][key] || key;
  };
  
  return { t, lang };
};