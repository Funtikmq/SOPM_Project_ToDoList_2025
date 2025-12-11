import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TaskItem = ({ task, onDelete, onToggleComplete }) => {
  return (
    <View style={[styles.taskContainer, task.completed && styles.taskContainerDone]}>
      <TouchableOpacity 
        style={[styles.checkBox, task.completed && styles.checkBoxDone]}
        onPress={() => onToggleComplete(task.id)}
      >
        <Text style={[styles.checkIcon, task.completed && styles.checkIconDone]}>
          {task.completed ? '✓' : ''}
        </Text>
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
          {task.title}
        </Text>
        {task.description && (
          <Text style={[styles.taskDescription, task.completed && styles.taskDescriptionDone]}>
            {task.description}
          </Text>
        )}
        {task.dueDate && (
          <Text style={[styles.taskDate, task.completed && styles.taskDescriptionDone]}>
            Termen: {new Date(task.dueDate).toLocaleDateString('ro-RO')}
          </Text>
        )}
        {task.completed && (
          <View style={styles.badgeDone}>
            <Text style={styles.badgeText}>Completat</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
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
  taskContent: {
    flex: 1,
    marginRight: 12,
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
  taskDescription: {
    fontSize: 14,
    color: '#d7c8ff',
    marginBottom: 4,
  },
  taskDescriptionDone: {
    color: '#8d7aac',
    textDecorationLine: 'line-through',
  },
  taskDate: {
    fontSize: 12,
    color: '#ff9ff3',
    fontStyle: 'italic',
  },
  taskContainerDone: {
    borderColor: 'rgba(122, 255, 208, 0.35)',
    shadowColor: '#7affe0',
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ff4dd2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 77, 210, 0.08)',
  },
  checkBoxDone: {
    borderColor: '#7affe0',
    backgroundColor: 'rgba(122, 255, 224, 0.12)',
  },
  checkIcon: {
    color: '#ff4dd2',
    fontSize: 16,
    fontWeight: '800',
  },
  checkIconDone: {
    color: '#0b0216',
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
  badgeDone: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: 'rgba(122, 255, 224, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(122, 255, 224, 0.4)',
  },
  badgeText: {
    color: '#7affe0',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default TaskItem;
