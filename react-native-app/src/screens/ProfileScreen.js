import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = this week, -1 = last week, etc.

  // Motivational messages
  const motivationalMessages = [
    '🚀 Cada día es una nueva oportunidad para brillar!',
    '💪 El éxito es una serie de pequeñas decisiones consistentes.',
    '✨ Tu esfuerzo de hoy es tu éxito de mañana.',
    '🎯 Las metas se alcanzan con paciencia y persistencia.',
    '🔥 ¡Tú puedes lograr lo que te propongas!',
    '🌟 Cada tarea completada es un paso hacia tus sueños.',
    '⚡ La disciplina es tu mejor aliada.',
    '🏆 Hoy es el día perfecto para hacer las cosas bien.',
    '💎 Tu potencial es ilimitado, ¡demuéstratelo!',
    '🌱 El crecimiento comienza fuera de tu zona de confort.',
  ];

  const mockTasks = global.mockTasks && Array.isArray(global.mockTasks) ? global.mockTasks : [];

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper to get date N days ago
  const getDateNDaysAgo = (n) => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date.toISOString().split('T')[0];
  };

  // Calculate streak (consecutive completed days)
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const tasksOnDate = mockTasks.filter(
        (t) => t.dueDate === dateStr && (t.status === 'Completed' || t.completed === true)
      );

      // If there's at least one completed task on this day, continue streak
      if (tasksOnDate.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Get week start date (Monday)
  const getWeekStart = (weeksOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + 1 + weeksOffset * 7); // Monday = 1
    return date;
  };

  // Get all dates in week
  const getWeekDates = (weeksOffset = 0) => {
    const weekStart = getWeekStart(weeksOffset);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const weekDates = getWeekDates(selectedWeek);
    let completed = 0;
    let total = 0;
    const dayStats = weekDates.map((dateStr) => {
      const tasksOnDate = mockTasks.filter((t) => t.dueDate === dateStr);
      const completedOnDate = tasksOnDate.filter((t) => t.status === 'Completed' || t.completed === true);
      completed += completedOnDate.length;
      total += tasksOnDate.length;
      return {
        date: dateStr,
        completed: completedOnDate.length,
        total: tasksOnDate.length,
      };
    });
    return {
      dayStats,
      totalCompleted: completed,
      totalTasks: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [mockTasks, selectedWeek, refreshKey]);

  const streak = useMemo(() => calculateStreak(), [mockTasks, refreshKey]);
  const randomMessage = useMemo(
    () => motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
    [refreshKey]
  );

  // Format date for display
  const formatWeekDisplay = () => {
    const weekStart = getWeekStart(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startStr = weekStart.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });
    const endStr = weekEnd.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });

    return `${startStr} - ${endStr}`;
  };

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profilul Tău</Text>
        </View>

        {/* Streak Card */}
        <View style={styles.card}>
          <View style={styles.streakContainer}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={styles.streakContent}>
              <Text style={styles.streakLabel}>Seria Curentă</Text>
              <Text style={styles.streakNumber}>{streak} zile</Text>
            </View>
          </View>
          <Text style={styles.streakSubtext}>
            {streak === 0
              ? 'Începe astazi o nouă serie! 💪'
              : `Continuă! ${streak === 1 ? 'Azi e prima zi!' : 'Ești pe drum bun!'}`}
          </Text>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>{randomMessage}</Text>
        </View>

        {/* Weekly Stats */}
        <View style={styles.card}>
          <View style={styles.weekHeader}>
            <TouchableOpacity
              style={styles.weekNavBtn}
              onPress={() => setSelectedWeek(selectedWeek - 1)}
            >
              <Text style={styles.weekNavText}>← Prev</Text>
            </TouchableOpacity>
            <Text style={styles.weekDisplay}>{formatWeekDisplay()}</Text>
            <TouchableOpacity
              style={styles.weekNavBtn}
              onPress={() => setSelectedWeek(selectedWeek + 1)}
              disabled={selectedWeek === 0}
            >
              <Text style={[styles.weekNavText, selectedWeek === 0 && styles.weekNavDisabled]}>
                Next →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Week Overview */}
          <View style={styles.weekOverview}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{weeklyStats.totalCompleted}</Text>
              <Text style={styles.overviewLabel}>Completate</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{weeklyStats.totalTasks}</Text>
              <Text style={styles.overviewLabel}>Total</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewPercentage}>{weeklyStats.percentage}%</Text>
              <Text style={styles.overviewLabel}>Completare</Text>
            </View>
          </View>

          {/* Daily Breakdown */}
          <View style={styles.dailyBreakdown}>
            <Text style={styles.sectionLabel}>Detalii pe zile:</Text>
            <View style={styles.dayGrid}>
              {weeklyStats.dayStats.map((day, idx) => {
                const completionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                const dayDate = new Date(day.date + 'T00:00:00');
                const dayNum = dayDate.getDate();

                return (
                  <View key={idx} style={styles.dayItem}>
                    <Text style={styles.dayLabel}>{dayLabels[idx]}</Text>
                    <View
                      style={[
                        styles.dayBar,
                        {
                          backgroundColor: getColorByCompletion(completionRate),
                        },
                      ]}
                    />
                    <Text style={styles.dayCount}>
                      {day.completed}/{day.total}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Rezumat</Text>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total taskuri create:</Text>
            <Text style={styles.statValue}>{mockTasks.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total completate:</Text>
            <Text style={styles.statValue}>{mockTasks.filter((t) => t.status === 'Completed' || t.completed === true).length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rata globală:</Text>
            <Text style={styles.statValue}>
              {mockTasks.length > 0
                ? Math.round(
                    (mockTasks.filter((t) => t.status === 'Completed' || t.completed === true).length / mockTasks.length) * 100
                  )
                : 0}
              %
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            global.testUser = null;
            global.mockTasks = [];
            navigation.replace('Login');
          }}
        >
          <Text style={styles.logoutBtnText}>Deconectare</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to get color based on completion percentage
const getColorByCompletion = (percentage) => {
  if (percentage === 0) return 'rgba(255, 77, 210, 0.1)';
  if (percentage < 25) return '#ff6b6b'; // Red
  if (percentage < 50) return '#ffa94d'; // Orange
  if (percentage < 75) return '#ffe066'; // Yellow
  return '#51cf66'; // Green
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0216',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.15)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ff4dd2',
  },
  card: {
    backgroundColor: '#12062a',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.15)',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  streakContent: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '600',
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ff4dd2',
  },
  streakSubtext: {
    fontSize: 13,
    color: '#d7c8ff',
    fontStyle: 'italic',
  },
  motivationCard: {
    backgroundColor: 'rgba(255, 77, 210, 0.12)',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff4dd2',
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff9ff3',
    textAlign: 'center',
    lineHeight: 24,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekNavBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 77, 210, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
  },
  weekNavText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff4dd2',
  },
  weekNavDisabled: {
    opacity: 0.5,
    color: '#888',
  },
  weekDisplay: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ff4dd2',
  },
  weekOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.15)',
    marginBottom: 16,
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ff4dd2',
    marginBottom: 4,
  },
  overviewPercentage: {
    fontSize: 22,
    fontWeight: '800',
    color: '#51cf66',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '600',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 77, 210, 0.15)',
  },
  dailyBreakdown: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ff4dd2',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  dayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d7c8ff',
  },
  dayBar: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    opacity: 0.8,
  },
  dayCount: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: '600',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.1)',
  },
  statLabel: {
    fontSize: 14,
    color: '#d7c8ff',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ff4dd2',
  },
  logoutBtn: {
    backgroundColor: '#ff4dd2',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logoutBtnText: {
    color: '#0b0216',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ProfileScreen;
