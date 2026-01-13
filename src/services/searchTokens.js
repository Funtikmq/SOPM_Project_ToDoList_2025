const normalize = (str) =>
  (str || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const splitWords = (str) =>
  normalize(str)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);

export const buildSearchTokens = (task = {}) => {
  const tokens = new Set();

  // title
  splitWords(task.title || "").forEach((w) => tokens.add(w));

  // priority
  if (task.priority) tokens.add(normalize(task.priority));

  // status
  if (task.status) tokens.add(normalize(task.status));

  // collaborators usernames
  if (Array.isArray(task.collaborators)) {
    task.collaborators.forEach((c) => {
      if (c?.username) splitWords(c.username).forEach((w) => tokens.add(w));
    });
  }

  // deadline parts
  if (task.deadline) {
    const parts = task.deadline.split("-");
    parts.forEach((p) => tokens.add(p));
  }

  return Array.from(tokens);
};
