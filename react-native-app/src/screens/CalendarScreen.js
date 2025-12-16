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

const getCalendarTheme = (isDark) => {
  if (isDark) {
    return {
      bg: '#0b0216',
      header: '#12062a',
      text: '#ffffff',
      textSecondary: '#d7c8ff',
      accent: '#ff4dd2',
      accentDim: 'rgba(255, 77, 210, 0.15)',
      accentBorder: 'rgba(255, 77, 210, 0.3)',
      border: 'rgba(255, 73, 214, 0.15)',
      btnBg: 'transparent',
      btnBgActive: 'rgba(255, 77, 210, 0.15)',
    };
  } else {
    return {
      bg: '#f8f7fc',
      header: '#ffffff',
      text: '#1a1a1a',
      textSecondary: '#666666',
      accent: '#ff4dd2',
      accentDim: 'rgba(255, 77, 210, 0.1)',
      accentBorder: 'rgba(255, 77, 210, 0.2)',
      border: 'rgba(255, 77, 210, 0.1)',
      btnBg: 'transparent',
      btnBgActive: 'rgba(255, 77, 210, 0.1)',
    };
  }
};

const CalendarScreen = ({ navigation, route, isDarkMode = true }) => {
  // Check if isDarkMode was passed via route params
  const routeIsDarkMode = route?.params?.isDarkMode;
  const actualIsDarkMode = routeIsDarkMode !== undefined ? routeIsDarkMode : isDarkMode;
  const theme = getCalendarTheme(actualIsDarkMode);
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backBtn, { backgroundColor: theme.accentDim, borderColor: theme.accentBorder }]}
        >
          <Text style={[styles.backBtnText, { color: theme.accent }]}>← Înapoi</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.accent }]}>Calendar</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Plan your tasks</Text>
        </View>
      </View>

      {/* View Mode Selector */}
      <View style={[styles.viewModeRow, { backgroundColor: theme.header, borderBottomColor: theme.border }]}>
        {['month', 'week', 'day'].map((mode) => {
          const isActive = viewMode === mode;
          const labels = { month: 'Lună', week: 'Săptămână', day: 'Zi' };
          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewModeBtn,
                {
                  borderColor: isActive ? theme.accent : theme.accentBorder,
                  backgroundColor: isActive ? theme.btnBgActive : theme.btnBg,
                }
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[styles.viewModeText, { color: isActive ? theme.accent : theme.textSecondary }]}>
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
          isDarkMode={actualIsDarkMode}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          tasksByDate={tasksByDate}
          onTaskPress={handleTaskPress}
          isDarkMode={actualIsDarkMode}
        />
      )}

      {viewMode === 'day' && (
        <DayTimeline
          selectedDate={selectedDate}
          tasksByDate={tasksByDate}
          onTaskPress={handleTaskPress}
          onSelectDate={handleDateSelect}
          isDarkMode={actualIsDarkMode}
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
        isDarkMode={actualIsDarkMode}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  backBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  viewModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  viewModeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewModeText: {
    fontWeight: '700',
    fontSize: 14,
  },
});

export default CalendarScreen;
