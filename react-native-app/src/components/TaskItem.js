import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const STATUS_ORDER = ['Overdue', 'Upcoming', 'Completed', 'Canceled'];

const TaskItem = ({ task, onDelete, onOpenDetail }) => {
  const badgeStyle = statusStyles[task.status] || statusStyles.Upcoming;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onOpenDetail(task.id)}
      style={[styles.taskContainer, task.completed && styles.taskContainerDone]}
    >
      <View style={styles.taskContentMinimal}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={[styles.statusPill, badgeStyle.container]}>
          <Text style={[styles.statusText, badgeStyle.text]}>{task.status || 'Upcoming'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    backgroundColor: '#1a0c38',
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.28)',
    shadowColor: '#ff4dd2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  taskContainerDone: {
    borderColor: 'rgba(122, 255, 208, 0.35)',
    shadowColor: '#7affe0',
  },
  taskContentMinimal: {
    flex: 1,
    marginRight: 12,
    gap: 6,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fef0ff',
    marginBottom: 4,
  },
  taskTitleDone: {
    color: '#9f8bc4',
    textDecorationLine: 'line-through',
  },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deleteButton: {
    backgroundColor: '#ff4dd2',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  deleteButtonText: {
    color: '#0b0216',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const statusStyles = {
  Overdue: {
    container: {
      backgroundColor: 'rgba(255, 104, 140, 0.12)',
      borderColor: 'rgba(255, 104, 140, 0.55)',
    },
    text: { color: '#ff688c' },
    chip: {
      borderColor: 'rgba(255, 104, 140, 0.4)',
      backgroundColor: 'rgba(255, 104, 140, 0.12)',
    },
    chipActive: {
      backgroundColor: '#ff688c',
      borderColor: '#ff688c',
    },
    chipText: { color: '#ffb3c8' },
    chipTextActive: { color: '#0b0216' },
  },
  Upcoming: {
    container: {
      backgroundColor: 'rgba(255, 77, 210, 0.12)',
      borderColor: 'rgba(255, 77, 210, 0.5)',
    },
    text: { color: '#ff9ff3' },
    chip: {
      borderColor: 'rgba(255, 77, 210, 0.35)',
      backgroundColor: 'rgba(255, 77, 210, 0.12)',
    },
    chipActive: {
      backgroundColor: '#ff4dd2',
      borderColor: '#ff4dd2',
    },
    chipText: { color: '#ffb8f6' },
    chipTextActive: { color: '#0b0216' },
  },
  Completed: {
    container: {
      backgroundColor: 'rgba(122, 255, 224, 0.15)',
      borderColor: 'rgba(122, 255, 224, 0.5)',
    },
    text: { color: '#7affe0' },
    chip: {
      borderColor: 'rgba(122, 255, 224, 0.4)',
      backgroundColor: 'rgba(122, 255, 224, 0.15)',
    },
    chipActive: {
      backgroundColor: '#7affe0',
      borderColor: '#7affe0',
    },
    chipText: { color: '#c3fff0' },
    chipTextActive: { color: '#0b0216' },
  },
  Canceled: {
    container: {
      backgroundColor: 'rgba(160, 160, 176, 0.12)',
      borderColor: 'rgba(160, 160, 176, 0.45)',
    },
    text: { color: '#cfd0de' },
    chip: {
      borderColor: 'rgba(160, 160, 176, 0.35)',
      backgroundColor: 'rgba(160, 160, 176, 0.12)',
    },
    chipActive: {
      backgroundColor: '#cfd0de',
      borderColor: '#cfd0de',
    },
    chipText: { color: '#e3e4f0' },
    chipTextActive: { color: '#0b0216' },
  },
};

export default TaskItem;
