import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CalendarGrid from '../components/calendar/CalendarGrid';
import WeekView from '../components/calendar/WeekView';
import DayTimeline from '../components/calendar/DayTimeline';
import TaskDetailSheet from '../components/TaskDetailSheet';

const CalendarScreen = ({ navigation }) => {
  // Use the global mockTasks from HomeScreen
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get tasks from the app's global state
  const mockTasks = global.mockTasks && Array.isArray(global.mockTasks) ? global.mockTasks : [];

  // Group tasks by date - re-trigger when refreshKey changes
  const tasksByDate = useMemo(() => {
    const grouped = {};
    mockTasks.forEach((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null;
      if (dueDate) {
        if (!grouped[dueDate]) {
          grouped[dueDate] = [];
        }
        grouped[dueDate].push(task);
      }
    });
    return grouped;
  }, [mockTasks, refreshKey]);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setViewMode('day');
  }, []);

  const handleTaskPress = useCallback((task) => {
    setSelectedTask(task);
    setDetailVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setSelectedTask(null);
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const handleDetailStatusChange = (status) => {
    if (!selectedTask) return;
    onTaskUpdate?.(selectedTask.id, { status });
    // Update global mockTasks
    if (global.mockTasks) {
      global.mockTasks = global.mockTasks.map((t) =>
        t.id === selectedTask.id ? { ...t, status } : t
      );
    }
  };

  const handleDetailDueChange = (dateString) => {
    if (!selectedTask) return;
    onTaskUpdate?.(selectedTask.id, { dueDate: dateString });
    // Update global mockTasks
    if (global.mockTasks) {
      global.mockTasks = global.mockTasks.map((t) =>
        t.id === selectedTask.id ? { ...t, dueDate: dateString } : t
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Înapoi</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.subtitle}>Plan your tasks</Text>
        </View>
      </View>

      {/* View Mode Selector */}
      <View style={styles.viewModeRow}>
        {['month', 'week', 'day'].map((mode) => {
          const isActive = viewMode === mode;
          const labels = { month: 'Lună', week: 'Săptămână', day: 'Zi' };
          return (
            <TouchableOpacity
              key={mode}
              style={[styles.viewModeBtn, isActive && styles.viewModeBtnActive]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[styles.viewModeText, isActive && styles.viewModeTextActive]}>
                {labels[mode]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Calendar Content */}
      {viewMode === 'month' && (
        <CalendarGrid
          tasksByDate={tasksByDate}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          tasksByDate={tasksByDate}
          onTaskPress={handleTaskPress}
        />
      )}

      {viewMode === 'day' && (
        <DayTimeline
          selectedDate={selectedDate}
          tasksByDate={tasksByDate}
          onTaskPress={handleTaskPress}
          onSelectDate={handleDateSelect}
        />
      )}

      <TaskDetailSheet
        visible={detailVisible}
        task={selectedTask}
        onClose={handleCloseDetail}
        onStatusChange={handleDetailStatusChange}
        onDueDateChange={handleDetailDueChange}
        onDelete={() => {
          if (selectedTask) onTaskDelete?.(selectedTask.id);
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#12062a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 73, 214, 0.15)',
  },
  backBtn: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 77, 210, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
  },
  backBtnText: {
    color: '#ff4dd2',
    fontWeight: '700',
    fontSize: 13,
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
  viewModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#12062a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.1)',
  },
  viewModeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.25)',
    backgroundColor: 'transparent',
  },
  viewModeBtnActive: {
    borderColor: '#ff4dd2',
    backgroundColor: 'rgba(255, 77, 210, 0.15)',
  },
  viewModeText: {
    color: '#d7c8ff',
    fontWeight: '700',
    fontSize: 14,
  },
  viewModeTextActive: {
    color: '#ff4dd2',
  },
});

export default CalendarScreen;
