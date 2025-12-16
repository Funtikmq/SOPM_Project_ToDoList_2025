// Scheduled function placeholder (to be deployed in Cloud Functions environment).
// Runs daily, scans recurring tasks, and auto-creates upcoming instances within the autoCreateWindow.
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Ensure firebase-admin is initialized once when the function loads
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.onScheduleDaily = onSchedule("every day 05:00", async () => {
  const db = getFirestore();
  const snap = await db.collection("tasks").where("recurring.isRecurring", "==", true).get();
  const now = new Date();

  for (const docSnap of snap.docs) {
    const task = docSnap.data();
    const recurring = task.recurring || {};
    const deadline = task.deadline;
    const anchorId = recurring.anchorTaskId || docSnap.id;

    const nextDate = computeNextDate(recurring, deadline);
    if (!nextDate) continue;

    const diffDays =
      (new Date(`${nextDate}T00:00:00`).getTime() - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24);
    if (diffDays > (recurring.autoCreateWindow || 7)) continue;

    const newId = `${anchorId}_${Date.now()}`;
    await db.collection("tasks").doc(newId).set(
      {
        ...task,
        id: newId,
        deadline: nextDate,
        status: "active",
        createdAt: Date.now(),
        updatedAt: FieldValue.serverTimestamp(),
        recurring: { ...recurring, anchorTaskId: anchorId },
        generatedFrom: { anchorTaskId: anchorId, recurringRule: recurring.type },
      },
      { merge: true }
    );
  }
});

function computeNextDate(recurring, currentDeadline) {
  // Mirror of calculateNextDate utility (simplified, without timezone handling).
  const WEEKDAY_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  if (!recurring?.isRecurring) return null;
  const base = currentDeadline ? new Date(`${currentDeadline}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  const interval = Math.max(1, recurring.interval || 1);
  let next;

  if (recurring.type === "daily") {
    next = new Date(base);
    next.setDate(next.getDate() + interval);
  } else if (recurring.type === "weekly") {
    const days = Array.isArray(recurring.byWeekday) && recurring.byWeekday.length ? recurring.byWeekday : ["mon"];
    const dayIndexes = days.map((d) => WEEKDAY_INDEX[d] ?? 1);
    const startIndex = base.getDay();
    let minDiff = Infinity;
    dayIndexes.forEach((idx) => {
      let diff = idx - startIndex;
      if (diff <= 0) diff += 7 * interval;
      if (diff < minDiff) minDiff = diff;
    });
    next = new Date(base);
    next.setDate(next.getDate() + minDiff);
  } else if (recurring.type === "monthly") {
    const targetDay = Math.min(Math.max(1, recurring.byMonthday || base.getDate()), 31);
    next = new Date(base);
    next.setMonth(next.getMonth() + interval);
    const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(targetDay, daysInMonth));
  } else return null;

  const endDate = recurring.endDate ? new Date(`${recurring.endDate}T00:00:00`) : null;
  if (endDate && next.getTime() > endDate.getTime()) return null;

  const y = next.getFullYear();
  const m = `${next.getMonth() + 1}`.padStart(2, "0");
  const d = `${next.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
