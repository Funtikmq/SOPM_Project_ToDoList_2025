import React, { useState, useEffect, useRef } from 'react';
import {
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert 
} from 'react-native';
import TaskItem from '../components/TaskItem';
import TaskInput from '../components/TaskInput';

// Mock data pentru testare - stocată în memorie
let mockTasks = [
  {
    id: '1',
    title: 'Cumpara lapte',
    description: 'De la supermarket',
    createdAt: new Date().toISOString(),
    userId: 'test-user-123',
    completed: false,
  },
  {
    id: '2',
    title: 'Completeaza proiectul',
    description: 'Finish React Native app',
    createdAt: new Date().toISOString(),
    userId: 'test-user-123',
    completed: false,
  },
];

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState(mockTasks);
  const [loading, setLoading] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const undoTimerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    // Simulez încărcarea task-urilor
    setLoading(true);
    setTimeout(() => {
      setTasks(mockTasks);
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
    };
    
    // Adaugă în mock data
    mockTasks.unshift(newTask);
    setTasks([...mockTasks]);
  };

  const handleToggleComplete = (taskId) => {
    mockTasks = mockTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks([...mockTasks]);
  };

  const handleDeleteTask = async (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    mockTasks = mockTasks.filter(task => task.id !== taskId);
    setTasks([...mockTasks]);
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
        <TouchableOpacity onPress={handleLogout} style={styles.logoutPill}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topCard}>
        <Text style={styles.topTitle}>Astăzi</Text>
        <Text style={styles.topValue}>{tasks.length} task-uri active</Text>
        <View style={styles.accentBar} />
      </View>

      <TaskInput onAddTask={handleAddTask} />

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Se încarcă...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📝</Text>
          <Text style={styles.emptySubtext}>
            Nu ai niciun task. Adaugă primul!
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

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
  accentBar: {
    height: 4,
    width: 80,
    backgroundColor: '#ff4dd2',
    borderRadius: 8,
    marginTop: 10,
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
