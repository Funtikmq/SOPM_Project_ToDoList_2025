import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskItem from '../components/TaskItem';
import TaskDetailSheet from '../components/TaskDetailSheet';
import AddTaskModal from '../components/AddTaskModal';
import { saveTask } from '../services/taskService';

// Mock data pentru testare - stocată în memorie
const getTodayDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

let mockTasks = [
  {
    id: '1',
    title: 'Cumpara lapte',
    description: 'De la supermarket',
    createdAt: new Date().toISOString(),
    userId: 'test-user-123',
    completed: false,
    status: 'Upcoming',
    progress: 0,
    dueDate: getTodayDate(),
  },
  {
    id: '2',
    title: 'Completeaza proiectul',
    description: 'Finish React Native app',
    createdAt: new Date().toISOString(),
    userId: 'test-user-123',
    completed: false,
    status: 'Upcoming',
    progress: 0,
    dueDate: getTomorrowDate(),
  },
];

// Initialize global tasks immediately
global.mockTasks = [...mockTasks];

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState(mockTasks);
  const [loading, setLoading] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const undoTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Upcoming');

  const statusCounts = useMemo(() => {
    return tasks.reduce(
      (acc, t) => {
        if (acc[t.status] !== undefined) {
          acc[t.status] += 1;
        }
        return acc;
      },
      { Upcoming: 0, Overdue: 0, Completed: 0 }
    );
  }, [tasks]);

  // Recurring preview helpers
  const WEEKDAY_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const computeNextDate = (recurring = {}, currentDeadline) => {
    if (!recurring?.isRecurring) return null;
    const base = currentDeadline ? new Date(`${currentDeadline}T00:00:00`) : new Date();
    if (Number.isNaN(base.getTime())) return null;
    const interval = Math.max(1, recurring.interval || 1);
    let next;
    if (recurring.type === 'daily') {
      next = new Date(base);
      next.setDate(next.getDate() + interval);
    } else if (recurring.type === 'weekly') {
      const days = Array.isArray(recurring.byWeekday) && recurring.byWeekday.length ? recurring.byWeekday : ['mon'];
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
    } else if (recurring.type === 'monthly') {
      const targetDay = Math.min(Math.max(1, recurring.byMonthday || base.getDate()), 31);
      next = new Date(base);
      next.setMonth(next.getMonth() + interval);
      const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(targetDay, daysInMonth));
    } else return null;
    const endDate = recurring.endDate ? new Date(`${recurring.endDate}T00:00:00`) : null;
    if (endDate && next.getTime() > endDate.getTime()) return null;
    const y = next.getFullYear();
    const m = `${next.getMonth() + 1}`.padStart(2, '0');
    const d = `${next.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const recurringPreview = useMemo(() => {
    return (tasks || [])
      .filter((t) => t.recurring?.isRecurring)
      .map((t) => ({ id: t.id, title: t.title, nextDate: computeNextDate(t.recurring, t.dueDate) }))
      .filter((x) => !!x.nextDate)
      .slice(0, 5);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const subset = tasks.filter((t) => t.status === filterStatus);
    return subset.sort((a, b) => {
      if (filterStatus === 'Completed') {
        const aTime = new Date(a.updatedAt || a.createdAt).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt).getTime();
        return bTime - aTime;
      }
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    });
  }, [tasks, filterStatus]);

  useEffect(() => {
    // Simulez încărcarea task-urilor
    setLoading(true);
    setTimeout(() => {
      setTasks(mockTasks);
      global.mockTasks = mockTasks;
      setLoading(false);
    }, 500);
  }, []);

  const handleAddTask = async (taskData) => {
    // Generez ID unic
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      userId: 'test-user-123',
      completed: false,
      status: 'Upcoming',
      progress: 0,
      autoStatus: true,
      subtasks: Array.isArray(taskData?.subtasks) ? taskData.subtasks.map((s, idx) => ({
        id: s.id || Math.random().toString(36).slice(2, 9),
        title: s.title || `Subtask ${idx+1}`,
        isCompleted: !!s.done || !!s.isCompleted,
      })) : [],
    };
    // Save via service (Firebase if available, else mock)
    const saved = await saveTask(newTask);
    // Adaugă în mock data
    mockTasks.unshift(saved);
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
  };

  const handleToggleComplete = (taskId) => {
    mockTasks = mockTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: !t.completed,
            status: !t.completed ? 'Completed' : 'Upcoming',
            progress: !t.completed ? 100 : 0,
          }
        : t
    );
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
  };

  const handleStatusChange = (taskId, status) => {
    mockTasks = mockTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status,
            completed: status === 'Completed' ? true : false,
            progress: status === 'Completed' ? 100 : t.progress ?? 0,
          }
        : t
    );
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
  };

  const handleProgressChange = (taskId, delta) => {
    mockTasks = mockTasks.map((t) => {
      if (t.id !== taskId) return t;
      const nextProgress = Math.min(100, Math.max(0, (t.progress ?? 0) + delta));
      const autoStatus = nextProgress >= 100 ? 'Completed' : t.status === 'Canceled' ? 'Canceled' : t.status === 'Overdue' ? 'Overdue' : 'Upcoming';
      return {
        ...t,
        progress: nextProgress,
        completed: autoStatus === 'Completed',
        status: autoStatus,
      };
    });
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
  };

  const handleAddSubtask = (taskId, title) => {
    mockTasks = mockTasks.map((t) => {
      if (t.id !== taskId) return t;
      const subtasks = [...(t.subtasks || []), { id: Math.random().toString(36).slice(2, 9), title, isCompleted: false }];
      return { ...t, subtasks };
    });
    recalcFromSubtasks(taskId);
    const updated = mockTasks.find((t) => t.id === taskId);
    setSelectedTask(updated || null);
  };

  const handleRemoveSubtask = (taskId, subtaskId) => {
    mockTasks = mockTasks.map((t) => {
      if (t.id !== taskId) return t;
      const subtasks = (t.subtasks || []).filter((s) => s.id !== subtaskId);
      return { ...t, subtasks };
    });
    recalcFromSubtasks(taskId);
    const updated = mockTasks.find((t) => t.id === taskId);
    setSelectedTask(updated || null);
  };

  const handleDueDateChange = (taskId, dateString) => {
    mockTasks = mockTasks.map((t) =>
      t.id === taskId ? recalcAutoStatus({ ...t, dueDate: dateString }) : t
    );
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
    const updated = mockTasks.find((t) => t.id === taskId);
    setSelectedTask(updated || null);
  };

  const recalcAutoStatus = (task) => {
    if (!task.autoStatus) return task;
    let status = task.status;
    if (task.progress >= 100) {
      status = 'Completed';
    } else if (task.dueDate) {
      const today = new Date();
      const due = new Date(task.dueDate);
      if (today > due) status = 'Overdue';
      else status = 'Upcoming';
    } else {
      status = 'Upcoming';
    }
    return {
      ...task,
      status,
      completed: status === 'Completed',
    };
  };

  const recalcFromSubtasks = (taskId) => {
    mockTasks = mockTasks.map((t) => {
      if (t.id !== taskId) return t;
      const total = t.subtasks?.length || 0;
      const completedCount = (t.subtasks || []).filter((s) => s.isCompleted).length;
      const progress = total > 0 ? Math.round((completedCount / total) * 100) : t.progress || 0;
      return recalcAutoStatus({ ...t, progress });
    });
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    mockTasks = mockTasks.map((t) => {
      if (t.id !== taskId) return t;
      const subtasks = (t.subtasks || []).map((s) =>
        s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
      );
      return { ...t, subtasks };
    });
    recalcFromSubtasks(taskId);
    global.mockTasks = mockTasks;
  };

  const handleAutoStatusToggle = (taskId) => {
    mockTasks = mockTasks.map((t) =>
      t.id === taskId ? { ...recalcAutoStatus({ ...t, autoStatus: !t.autoStatus }) } : t
    );
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
  };

  const handleOpenDetail = (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setSelectedTask(t);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedTask(null);
  };

  const handleDetailStatusChange = (status) => {
    if (!selectedTask) return;
    handleStatusChange(selectedTask.id, status);
    const updated = mockTasks.find((t) => t.id === selectedTask.id);
    setSelectedTask(updated || null);
  };

  const handleDetailToggleSubtask = (subtaskId) => {
    if (!selectedTask) return;
    handleToggleSubtask(selectedTask.id, subtaskId);
    const updated = mockTasks.find((t) => t.id === selectedTask.id);
    setSelectedTask(updated || null);
  };

  const handleDetailAutoToggle = () => {
    if (!selectedTask) return;
    handleAutoStatusToggle(selectedTask.id);
    const updated = mockTasks.find((t) => t.id === selectedTask.id);
    setSelectedTask(updated || null);
  };

  const handleDetailAddSubtask = (title) => {
    if (!selectedTask) return;
    handleAddSubtask(selectedTask.id, title);
  };

  const handleDetailRemoveSubtask = (subtaskId) => {
    if (!selectedTask) return;
    handleRemoveSubtask(selectedTask.id, subtaskId);
  };

  const handleDetailDueChange = (dateString) => {
    if (!selectedTask) return;
    handleDueDateChange(selectedTask.id, dateString);
  };

  const handleDetailUpdateRecurrence = (recurringPayload) => {
    if (!selectedTask) return;
    mockTasks = mockTasks.map((t) => {
      if (t.id !== selectedTask.id) return t;
      const next = { ...t, recurring: { ...(t.recurring || {}), ...recurringPayload } };
      return next;
    });
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
    const updated = mockTasks.find((t) => t.id === selectedTask.id);
    setSelectedTask(updated || null);
  };

  const handleDeleteTask = async (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    mockTasks = mockTasks.filter(task => task.id !== taskId);
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
    setLastDeleted(target);

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setUndoSeconds(5);
    countdownRef.current = setInterval(() => {
      setUndoSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(countdownRef.current);
        }
        return next;
      });
    }, 1000);

    undoTimerRef.current = setTimeout(() => {
      setLastDeleted(null);
      setUndoSeconds(0);
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;
    mockTasks.unshift(lastDeleted);
    setTasks([...mockTasks]);
    global.mockTasks = mockTasks;
    setLastDeleted(null);
    setUndoSeconds(0);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Deconectare',
      'Ești sigur că vrei să te deconectezi?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Deconectare',
          onPress: async () => {
            // Șterge mock user
            global.testUser = null;
            // Reîncarcă navigatorul
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.subtitle}>Just Do It</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Calendar')} 
            style={styles.calendarBtn}
          >
            <Text style={styles.calendarBtnText}>📅</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutPill}>
            <Text style={styles.logoutButton}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topCard}>
        <Text style={styles.topTitle}>Astăzi</Text>
        <Text style={styles.topValue}>
          {filteredTasks.length} {filterStatus.toLowerCase()} task-uri
        </Text>
        <Text style={styles.topSub}>
          Upcoming {statusCounts.Upcoming} · Overdue {statusCounts.Overdue} · Completed {statusCounts.Completed}
        </Text>
        <View style={styles.accentBar} />
      </View>

      {/* Recurring preview */}
      <View style={styles.recurringCard}>
        <Text style={styles.recurringTitle}>Task-uri recurente (următoarea dată)</Text>
        {recurringPreview.length === 0 ? (
          <Text style={styles.recurringEmpty}>Nu există reguli de recurență definite.</Text>
        ) : (
          recurringPreview.map((x) => (
            <View key={x.id} style={styles.recurringItem}>
              <Text style={styles.recurringItemTitle}>{x.title}</Text>
              <Text style={styles.recurringItemDate}>{x.nextDate}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.filterRow}>
        {['Upcoming', 'Overdue', 'Completed'].map((status) => {
          const isActive = filterStatus === status;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {status}
              </Text>
              <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                  {statusCounts[status] || 0}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Inline quick add removed to avoid duplication with modal */}

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Se încarcă...</Text>
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📝</Text>
          <Text style={styles.emptySubtext}>
            Nicio sarcină în filtrul curent ({filterStatus}).
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
              onStatusChange={handleStatusChange}
              onProgressChange={handleProgressChange}
              onOpenDetail={handleOpenDetail}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {addVisible && (
        <AddTaskModal
          visible={addVisible}
          onClose={() => setAddVisible(false)}
          onSave={async (taskPayload) => {
            await handleAddTask(taskPayload);
            setAddVisible(false);
          }}
        />
      )}

      {/* Floating add button (bottom-center pill) */}
      <TouchableOpacity style={styles.fabCenter} onPress={() => setAddVisible(true)}>
        <Text style={styles.fabCenterText}>＋ Adaugă Task</Text>
      </TouchableOpacity>

      {lastDeleted && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>
            Task șters · {undoSeconds}s
          </Text>
          <TouchableOpacity onPress={handleUndoDelete} style={styles.undoButton}>
            <Text style={styles.undoButtonText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}

      <TaskDetailSheet
        visible={detailVisible}
        task={selectedTask}
        onClose={handleCloseDetail}
        onToggleSubtask={(subId) => handleDetailToggleSubtask(subId)}
        onAddSubtask={(title) => handleDetailAddSubtask(title)}
              onUpdateRecurrence={handleDetailUpdateRecurrence}
        onRemoveSubtask={(subId) => handleDetailRemoveSubtask(subId)}
        onStatusChange={handleDetailStatusChange}
        onAutoStatusToggle={handleDetailAutoToggle}
        onDueDateChange={(dateString) => handleDetailDueChange(dateString)}
        onDelete={() => {
          if (selectedTask) handleDeleteTask(selectedTask.id);
          handleCloseDetail();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0216',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#12062a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 73, 214, 0.15)',
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  kicker: {
    color: '#ff9ff3',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ff4dd2',
  },
  subtitle: {
    fontSize: 14,
    color: '#d7c8ff',
    marginTop: 4,
  },
  logoutButton: {
    color: '#0b0216',
    fontSize: 15,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 77, 210, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
  },
  fabCenter: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    backgroundColor: '#ff4dd2',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabCenterText: {
    color: '#0b0216',
    fontSize: 16,
    fontWeight: '800',
  },
  calendarBtnText: {
    fontSize: 18,
  },
  logoutPill: {
    backgroundColor: '#ff9ff3',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#d7c8ff',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#d7c8ff',
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  topCard: {
    backgroundColor: '#140a2e',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  topTitle: {
    color: '#d7c8ff',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  topValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  topSub: {
    color: '#d7c8ff',
    fontSize: 13,
    marginTop: 4,
  },
  recurringCard: {
    backgroundColor: '#140a2e',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.25)',
  },
  recurringTitle: {
    color: '#d7c8ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  recurringEmpty: {
    color: '#d7c8ff',
    fontSize: 12,
  },
  recurringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  recurringItemTitle: {
    color: '#ffffff',
    fontSize: 13,
  },
  recurringItemDate: {
    color: '#ff4dd2',
    fontSize: 13,
    fontWeight: '700',
  },
  accentBar: {
    height: 4,
    width: 80,
    backgroundColor: '#ff4dd2',
    borderRadius: 8,
    marginTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 6,
    marginTop: 4,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.25)',
    backgroundColor: '#12062a',
  },
  filterChipActive: {
    borderColor: '#ff4dd2',
    backgroundColor: 'rgba(255, 77, 210, 0.12)',
  },
  filterChipText: {
    color: '#d7c8ff',
    fontWeight: '700',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#ff4dd2',
  },
  filterCount: {
    minWidth: 26,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#1f0c3d',
  },
  filterCountActive: {
    backgroundColor: '#ff4dd2',
  },
  filterCountText: {
    color: '#d7c8ff',
    fontWeight: '700',
    textAlign: 'center',
  },
  filterCountTextActive: {
    color: '#0b0216',
  },
  undoBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#1f0c3d',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  undoText: {
    color: '#f2eaff',
    fontSize: 15,
    fontWeight: '600',
  },
  undoButton: {
    backgroundColor: '#ff4dd2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  undoButtonText: {
    color: '#0b0216',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default HomeScreen;
