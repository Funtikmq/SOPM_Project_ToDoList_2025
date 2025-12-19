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
    cancel: "Anulează",
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
    deleteTask: "Șterge task",
    activityLog: "Istoric activitate",
    "activity.empty": "Nicio activitate încă",
    "activity.statusChanged": "Status modificat",
    "activity.titleChanged": "Titlu modificat",
    "activity.descriptionChanged": "Descriere modificată",
    "activity.priorityChanged": "Prioritate modificată",
    "activity.deadlineChanged": "Deadline modificat",
    "activity.subtaskAdded": "Subtask adăugat",
    "activity.subtaskRemoved": "Subtask șters",
    "activity.subtaskCompleted": "Subtask completat",
    "activity.collaboratorAdded": "Colaborator adăugat",
    "activity.collaboratorRemoved": "Colaborator eliminat",
    "activity.collaboratorRoleChanged": "Rol colaborator modificat",
    "activity.commentAdded": "Comentariu adăugat",
    "activity.taskCreated": "Task creat",
    "activity.taskDeleted": "Task șters",
    "calendar.title": "Calendar",
    "calendar.month": "Luna",
    "calendar.week": "Saptamana",
    "calendar.today": "Astazi",
    "calendar.noTasks": "Fără task-uri",
    "calendar.dragToReschedule": "Trage task-urile pe altă zi pentru a reprograma",
    "calendar.deadlineUpdated": "Deadline actualizat",
    "calendar.miniCalendar": "Calendar",
    // Misc / shared
    search: "Caută",
    noTags: "Nu există etichete încă",
    addTag: "Adaugă etichetă",
    color: "Culoare",
    add: "Adaugă",
    noDeadline: "Fără deadline",
    // Comments
    comments: "Comentarii",
    noComments: "Niciun comentariu încă",
    addComment: "Adaugă comentariu...",
    edit: "Editează",
    delete: "Șterge",
    edited: "editat",
    post: "Postează",
    // Stats bar labels
    Total: "Total",
    Active: "Activ",
    Completed: "Finalizat",
    Overdue: "Întârziat",
    // ShareTaskModal
    searchCollaborators: "Caută colaboratori… (#username)",
    searching: "Se caută...",
    // AddTask
    interval: "Interval",
    day: "Zi",
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
    cancel: "Cancel",
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
    deleteTask: "Delete task",
    activityLog: "Activity Log",
    "activity.empty": "No activity yet",
    "activity.statusChanged": "Status changed",
    "activity.titleChanged": "Title changed",
    "activity.descriptionChanged": "Description changed",
    "activity.priorityChanged": "Priority changed",
    "activity.deadlineChanged": "Deadline changed",
    "activity.subtaskAdded": "Subtask added",
    "activity.subtaskRemoved": "Subtask removed",
    "activity.subtaskCompleted": "Subtask completed",
    "activity.collaboratorAdded": "Collaborator added",
    "activity.collaboratorRemoved": "Collaborator removed",
    "activity.collaboratorRoleChanged": "Collaborator role changed",
    "activity.commentAdded": "Comment added",
    "activity.taskCreated": "Task created",
    "activity.taskDeleted": "Task deleted",
    "calendar.title": "Calendar",
    "calendar.month": "Month",
    "calendar.week": "Week",
    "calendar.today": "Today",
    "calendar.noTasks": "No tasks",
    "calendar.dragToReschedule": "Drag tasks onto another day to reschedule",
    "calendar.deadlineUpdated": "Deadline updated",
    "calendar.miniCalendar": "Mini Calendar",
    // Misc / shared
    search: "Search tags",
    noTags: "No tags yet",
    addTag: "New tag",
    color: "Color",
    add: "Add",
    noDeadline: "No deadline",
    // Comments
    comments: "Comments",
    noComments: "No comments yet",
    addComment: "Add a comment...",
    edit: "Edit",
    delete: "Delete",
    edited: "edited",
    post: "Post",
    // Stats bar labels
    Total: "Total",
    Active: "Active",
    Completed: "Completed",
    Overdue: "Overdue",
    // ShareTaskModal
    searchCollaborators: "Search collaborators… (#username)",
    searching: "Searching…",
    // AddTask
    interval: "Interval",
    day: "Day",

  },
};

export const useTranslate = () => {
  const lang = localStorage.getItem("language") || "ro";

  const t = (key) => translations[lang]?.[key] || key;

  return { t, lang };
};
