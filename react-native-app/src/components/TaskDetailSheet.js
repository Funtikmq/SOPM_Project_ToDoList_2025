import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  Switch,
  TextInput,
} from 'react-native';

const STATUS_OPTIONS = ['Upcoming', 'Overdue', 'Completed', 'Canceled'];

const TaskDetailSheet = ({
  visible,
  task,
  onClose,
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
  onStatusChange,
  onAutoStatusToggle,
  onDueDateChange,
  onDelete,
}) => {
  const translateY = useRef(new Animated.Value(400)).current;
  const [subtaskTitle, setSubtaskTitle] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!task) return null;

  const completedSubtasks = (task.subtasks || []).filter((s) => s.isCompleted).length;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = task.progress ?? (totalSubtasks ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0);

  const handleAddSubtaskLocal = () => {
    if (!subtaskTitle.trim()) return;
    onAddSubtask(subtaskTitle.trim());
    setSubtaskTitle('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      </View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>\
        <View style={styles.dragBar} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.subtitle}>{progress}% completed</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressBarOuter}>
            <View style={[styles.progressBarInner, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>

        <View style={styles.dueRow}>
          <Text style={styles.sectionTitleInline}>Due date</Text>
          <Text style={styles.dueValue}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('ro-RO') : 'No due date'}</Text>
        </View>
        <View style={styles.dueChipsRow}>
          <TouchableOpacity style={styles.dueChip} onPress={() => onDueDateChange(new Date().toISOString())}>
            <Text style={styles.dueChipText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dueChip} onPress={() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            onDueDateChange(d.toISOString());
          }}>
            <Text style={styles.dueChipText}>Tomorrow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dueChipGhost} onPress={() => onDueDateChange(null)}>
            <Text style={styles.dueChipGhostText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((status) => {
            const active = task.status === status;
            return (
              <TouchableOpacity
                key={status}
                style={[styles.statusChip, active && styles.statusChipActive]}
                onPress={() => onStatusChange(status)}
              >
                <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Auto status</Text>
          <Switch
            value={!!task.autoStatus}
            onValueChange={onAutoStatusToggle}
            thumbColor={task.autoStatus ? '#ff4dd2' : '#ccc'}
            trackColor={{ false: '#4a4458', true: '#ff9ff3' }}
          />
        </View>

        <Text style={styles.sectionTitle}>Subtasks</Text>
        <View style={styles.addSubtaskRow}>
          <TextInput
            style={styles.subtaskInput}
            placeholder="Adaugă subtask"
            placeholderTextColor="#8d7aac"
            value={subtaskTitle}
            onChangeText={setSubtaskTitle}
            onSubmitEditing={handleAddSubtaskLocal}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addSubtaskButton} onPress={handleAddSubtaskLocal}>
            <Text style={styles.addSubtaskText}>Add</Text>
          </TouchableOpacity>
        </View>
        {(!task.subtasks || task.subtasks.length === 0) ? (
          <Text style={styles.emptySubtasks}>Nicio subtask.</Text>
        ) : (
          <FlatList
            data={task.subtasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.subtaskRow}
                onPress={() => onToggleSubtask(item.id)}
              >
                <View style={[styles.subtaskCheckbox, item.isCompleted && styles.subtaskCheckboxDone]}>
                  <Text style={styles.subtaskCheckIcon}>{item.isCompleted ? '✓' : ''}</Text>
                </View>
                <Text style={[styles.subtaskText, item.isCompleted && styles.subtaskTextDone]}>
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => onRemoveSubtask(item.id)} style={styles.subtaskDelete}>
                  <Text style={styles.subtaskDeleteText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionGhost} onPress={onClose}>
            <Text style={styles.actionGhostText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#0e0920',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  dragBar: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#352a4d',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#d7c8ff',
    marginTop: 4,
  },
  closeText: {
    color: '#ff9ff3',
    fontSize: 20,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  progressBarOuter: {
    flex: 1,
    height: 10,
    backgroundColor: '#12062a',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.25)',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: '#7affe0',
  },
  progressValue: {
    color: '#ffb8f6',
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.25)',
    backgroundColor: '#140a2e',
  },
  statusChipActive: {
    backgroundColor: '#ff4dd2',
    borderColor: '#ff4dd2',
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statusChipText: {
    color: '#d7c8ff',
    fontWeight: '700',
  },
  statusChipTextActive: {
    color: '#0b0216',
  },
  toggleRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#fef0ff',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#fef0ff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 8,
  },
  emptySubtasks: {
    color: '#9f8bc4',
    marginBottom: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  subtaskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ff4dd2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 210, 0.08)',
  },
  subtaskCheckboxDone: {
    borderColor: '#7affe0',
    backgroundColor: 'rgba(122, 255, 224, 0.15)',
  },
  subtaskCheckIcon: {
    color: '#0b0216',
    fontWeight: '800',
  },
  subtaskText: {
    color: '#fef0ff',
    fontSize: 15,
    flex: 1,
  },
  subtaskTextDone: {
    color: '#8d7aac',
    textDecorationLine: 'line-through',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ff4dd2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#0b0216',
    fontWeight: '800',
  },
  actionGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.35)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#140a2e',
  },
  actionGhostText: {
    color: '#ffb8f6',
    fontWeight: '700',
  },
  dueRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleInline: {
    color: '#fef0ff',
    fontSize: 15,
    fontWeight: '800',
  },
  dueValue: {
    color: '#d7c8ff',
    fontWeight: '600',
  },
  dueChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  dueChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#140a2e',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
  },
  dueChipText: {
    color: '#ffb8f6',
    fontWeight: '700',
  },
  dueChipGhost: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.25)',
    backgroundColor: 'transparent',
  },
  dueChipGhostText: {
    color: '#9f8bc4',
    fontWeight: '700',
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: '#140a2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fef0ff',
  },
  addSubtaskButton: {
    backgroundColor: '#ff4dd2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addSubtaskText: {
    color: '#0b0216',
    fontWeight: '800',
  },
  subtaskDelete: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 6,
  },
  subtaskDeleteText: {
    color: '#ff9ff3',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default TaskDetailSheet;
