import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const CalendarGrid = ({ tasksByDate, selectedDate, onSelectDate }) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const calendarDays = useMemo(() => {
    const days = [];
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  }, [year, month, daysInMonth, startingDayOfWeek]);

  const monthName = new Date(year, month).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthTitle}>{monthName}</Text>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
          <Text key={idx} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.gridContainer}>
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <View key={`empty-${idx}`} style={styles.dayCell} />;
          }

          const dateStr = date.toISOString().split('T')[0];
          const tasks = tasksByDate[dateStr] || [];
          const isToday = new Date().toDateString() === date.toDateString();
          const isSelected = selectedDate.toDateString() === date.toDateString();

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                isToday && styles.dayCellToday,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => onSelectDate(date)}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {date.getDate()}
              </Text>
              {tasks.length > 0 && (
                <View style={styles.taskDots}>
                  {tasks.slice(0, 2).map((task, i) => (
                    <View
                      key={i}
                      style={[
                        styles.taskDot,
                        { backgroundColor: getStatusColor(task.status) },
                      ]}
                    />
                  ))}
                  {tasks.length > 2 && (
                    <Text style={styles.moreText}>+{tasks.length - 2}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#4ade80';
    case 'Overdue':
      return '#ef4444';
    case 'Upcoming':
      return '#ff4dd2';
    default:
      return '#d7c8ff';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0216',
    paddingHorizontal: 12,
  },
  monthHeader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff4dd2',
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.1)',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: '#d7c8ff',
    fontWeight: '700',
    fontSize: 13,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.1)',
    padding: 8,
    justifyContent: 'flex-start',
  },
  dayCellToday: {
    backgroundColor: 'rgba(255, 77, 210, 0.08)',
    borderColor: '#ff4dd2',
  },
  dayCellSelected: {
    backgroundColor: 'rgba(255, 77, 210, 0.15)',
    borderColor: '#ff4dd2',
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d7c8ff',
  },
  dayNumberSelected: {
    color: '#ff4dd2',
  },
  taskDots: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  taskDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3,
  },
  moreText: {
    fontSize: 10,
    color: '#ff9ff3',
    fontWeight: '600',
  },
});

export default CalendarGrid;
