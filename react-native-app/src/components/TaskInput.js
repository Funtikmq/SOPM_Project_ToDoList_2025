import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const TaskInput = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAddTask = () => {
    if (title.trim()) {
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setDescription('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Titlu task..."
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Descriere (opțional)..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
        placeholderTextColor="#999"
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddTask}
      >
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#12062a',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.15)',
  },
  input: {
    backgroundColor: '#1a0c38',
    color: '#f2eaff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.22)',
  },
  descriptionInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#ff4dd2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  addButtonText: {
    color: '#0b0216',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default TaskInput;
