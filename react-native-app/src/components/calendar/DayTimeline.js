import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const HOUR_HEIGHT = 80;

const DayTimeline = ({ selectedDate, tasksByDate, onTaskPress, onSelectDate }) => {
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayTasks = tasksByDate[dateStr] || [];

  const dayName = selectedDate.toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Scroll to current time on mount
  const scrollRef = useRef(null);
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: currentHour * HOUR_HEIGHT - 100, animated: true });
      }
    }, 300);
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      {/* Date header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{dayName}</Text>
        <View style={styles.taskCountBadge}>
          <Text style={styles.taskCountText}>{dayTasks.length} sarcini</Text>
        </View>
      </View>

      {/* Navigation buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => {
            const prevDay = new Date(selectedDate);
            prevDay.setDate(prevDay.getDate() - 1);
            onSelectDate(prevDay);
          }}
        >
          <Text style={styles.navBtnText}>← Ieri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => onSelectDate(new Date())}
        >
          <Text style={styles.navBtnText}>Astazi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            onSelectDate(nextDay);
          }}
        >
          <Text style={styles.navBtnText}>Mâine →</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <ScrollView
        ref={scrollRef}
        style={styles.timelineScroll}
        scrollEventThrottle={16}
      >
        {hours.map((hour) => {
          const timeStr = String(hour).padStart(2, '0') + ':00';
          const now = new Date();
          const isCurrentHour =
            hour === now.getHours() &&
            selectedDate.toDateString() === now.toDateString();

          return (
            <View key={hour}>
              {/* Hour marker */}
              <View
                style={[
                  styles.hourRow,
                  isCurrentHour && styles.hourRowCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.hourLabel,
                    isCurrentHour && styles.hourLabelCurrent,
                  ]}
                >
                  {timeStr}
                </Text>
                <View
                  style={[
                    styles.hourLine,
                    isCurrentHour && styles.hourLineCurrent,
                  ]}
                />
              </View>

              {/* Tasks in this hour */}
              <View style={styles.tasksInHour}>
                {dayTasks.map((task) => {
                  // Simple placement: first task at hour 9, rest staggered
                  const taskHour = 9 + (dayTasks.indexOf(task) * 2);
                  if (taskHour === hour) {
                    return (
                      <TouchableOpacity
                        key={task.id}
                        style={[
                          styles.taskInTimeline,
                          { backgroundColor: getTaskColor(task.status) },
                        ]}
                        onPress={() => onTaskPress(task)}
                      >
                        <Text style={styles.taskTimelineTitle}>
                          {task.title}
                        </Text>
                        <Text style={styles.taskTimelineStatus}>
                          {task.status}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  return null;
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Summary footer */}
      {dayTasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nicio sarcină azi</Text>
          <Text style={styles.emptySubtext}>O zi libera! 🎉</Text>
        </View>
      )}

      {dayTasks.length > 0 && (
        <View style={styles.tasksSummary}>
          <Text style={styles.summaryTitle}>Rezumat zilei</Text>
          {dayTasks.map((task) => (
            <View key={task.id} style={styles.summaryItem}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getTaskColor(task.status) },
                ]}
              />
              <Text style={styles.summaryItemText} numberOfLines={1}>
                {task.title}
              </Text>
              <Text style={styles.summaryStatus}>{task.status}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const getTaskColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#4ade80';
    case 'Overdue':
      return '#ef4444';
    case 'Upcoming':
      return '#ff4dd2';
    default:
      return '#a78bfa';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0216',
  },
  dateHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#12062a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ff4dd2',
    textTransform: 'capitalize',
  },
  taskCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 77, 210, 0.15)',
  },
  taskCountText: {
    color: '#ff9ff3',
    fontWeight: '700',
    fontSize: 12,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0b0216',
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
    backgroundColor: 'rgba(255, 77, 210, 0.05)',
  },
  navBtnText: {
    color: '#ff4dd2',
    fontWeight: '700',
    fontSize: 13,
  },
  timelineScroll: {
    flex: 1,
    paddingLeft: 12,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 0,
    minHeight: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.05)',
  },
  hourRowCurrent: {
    backgroundColor: 'rgba(255, 77, 210, 0.08)',
  },
  hourLabel: {
    width: 50,
    fontSize: 13,
    fontWeight: '700',
    color: '#a78bfa',
    paddingTop: 4,
  },
  hourLabelCurrent: {
    color: '#ff4dd2',
    fontWeight: '800',
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 77, 210, 0.1)',
    marginRight: 12,
    marginTop: 10,
  },
  hourLineCurrent: {
    backgroundColor: '#ff4dd2',
    height: 2,
  },
  tasksInHour: {
    position: 'absolute',
    top: 0,
    left: 60,
    right: 12,
    minHeight: HOUR_HEIGHT,
    justifyContent: 'center',
  },
  taskInTimeline: {
    padding: 12,
    borderRadius: 10,
    marginRight: 12,
    marginBottom: 8,
  },
  taskTimelineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  taskTimelineStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff4dd2',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#d7c8ff',
  },
  tasksSummary: {
    backgroundColor: '#12062a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 77, 210, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 160,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ff4dd2',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.1)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  summaryItemText: {
    flex: 1,
    fontSize: 13,
    color: '#d7c8ff',
    fontWeight: '600',
  },
  summaryStatus: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default DayTimeline;
