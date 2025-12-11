import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CELL_HEIGHT = 60;

const WeekView = ({ selectedDate, onSelectDate, tasksByDate, onTaskPress }) => {
  const [scrollRef, setScrollRef] = useState(null);

  // Get start of week (Monday)
  const startOfWeek = new Date(selectedDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [startOfWeek]);

  // Generate hourly slots
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayHeaderScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.dayHeaderRow}>
          {weekDays.map((date, idx) => {
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const dayName = date.toLocaleDateString('ro-RO', { weekday: 'short' });
            const dayNum = date.getDate();

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayHeader,
                  isSelected && styles.dayHeaderActive,
                ]}
                onPress={() => onSelectDate(date)}
              >
                <Text style={styles.dayNameText}>{dayName}</Text>
                <Text
                  style={[
                    styles.dayNumText,
                    isSelected && styles.dayNumTextActive,
                  ]}
                >
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Timeline grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.timelineGrid}>
          {/* Time labels */}
          <View style={styles.timeColumn}>
            {hours.map((hour) => (
              <View key={hour} style={styles.timeSlot}>
                <Text style={styles.timeText}>{String(hour).padStart(2, '0')}:00</Text>
              </View>
            ))}
          </View>

          {/* Day columns with tasks */}
          {weekDays.map((date, dayIdx) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayTasks = tasksByDate[dateStr] || [];

            return (
              <View key={dayIdx} style={styles.dayColumn}>
                {hours.map((hour) => (
                  <View
                    key={hour}
                    style={[
                      styles.hourCell,
                      hour % 2 === 0 && styles.hourCellAlt,
                    ]}
                  >
                    {/* Render tasks in this hour */}
                    {dayTasks.map((task) => {
                      // Simple logic: if task due on this day, show it in first slot
                      if (dayTasks.indexOf(task) === 0 && hour === 9) {
                        return (
                          <TouchableOpacity
                            key={task.id}
                            style={[
                              styles.taskBlock,
                              { backgroundColor: getTaskColor(task.status) },
                            ]}
                            onPress={() => onTaskPress(task)}
                          >
                            <Text
                              style={styles.taskBlockText}
                              numberOfLines={2}
                            >
                              {task.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                      return null;
                    })}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const getTaskColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'rgba(74, 222, 128, 0.7)';
    case 'Overdue':
      return 'rgba(239, 68, 68, 0.7)';
    case 'Upcoming':
      return 'rgba(255, 77, 210, 0.7)';
    default:
      return 'rgba(215, 200, 255, 0.7)';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0216',
  },
  dayHeaderScroll: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.1)',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#12062a',
  },
  dayHeader: {
    width: 80,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 77, 210, 0.1)',
  },
  dayHeaderActive: {
    backgroundColor: 'rgba(255, 77, 210, 0.1)',
  },
  dayNameText: {
    fontSize: 12,
    color: '#d7c8ff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dayNumText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#d7c8ff',
    marginTop: 4,
  },
  dayNumTextActive: {
    color: '#ff4dd2',
  },
  timelineGrid: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 60,
    backgroundColor: '#12062a',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 77, 210, 0.1)',
  },
  timeSlot: {
    height: CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.05)',
  },
  timeText: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: '600',
  },
  dayColumn: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 77, 210, 0.1)',
  },
  hourCell: {
    height: CELL_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.05)',
    padding: 4,
  },
  hourCellAlt: {
    backgroundColor: 'rgba(255, 77, 210, 0.02)',
  },
  taskBlock: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  taskBlockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default WeekView;
