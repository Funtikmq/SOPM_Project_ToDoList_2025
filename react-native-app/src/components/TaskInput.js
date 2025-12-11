import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Modal, ScrollView, FlatList } from 'react-native';

const TaskInput = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const handleAddTask = () => {
    if (title.trim()) {
      const dueDateTime = `${selectedDate}T${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}:00`;
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
        dueDate: selectedDate,
        dueTime: `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`,
      });
      setTitle('');
      setDescription('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedHour(9);
      setSelectedMinute(0);
      setPickerMonth(new Date().getMonth());
      setPickerYear(new Date().getFullYear());
    }
  };

  const formatDisplayDate = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    return date.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDisplayTime = () => {
    return `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
  };

  // Generate calendar days for the selected month/year
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(pickerMonth, pickerYear);
    const firstDay = getFirstDayOfMonth(pickerMonth, pickerYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDaySelect = (day) => {
    if (day) {
      const dateStr = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(dateStr);
    }
  };

  const monthNames = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
  
  const calendarDays = generateCalendarDays();

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

      {/* Date and Time Selection */}
      <View style={styles.dateTimeRow}>
        <TouchableOpacity 
          style={styles.dateTimeButton}
          onPress={() => setShowDateTimePicker(true)}
        >
          <Text style={styles.dateTimeLabel}>📅 {formatDisplayDate()}</Text>
          <Text style={styles.dateTimeValue}>🕐 {formatDisplayTime()}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddTask}
      >
        <Text style={styles.addButtonText}>Adaugă Task</Text>
      </TouchableOpacity>

      {/* Date/Time Picker Modal */}
      <Modal
        visible={showDateTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selectează Data și Ora</Text>
              <TouchableOpacity onPress={() => setShowDateTimePicker(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerSection} showsVerticalScrollIndicator={false}>
              {/* Month/Year Selection */}
              <View style={styles.dateNavSection}>
                <View style={styles.monthYearRow}>
                  <TouchableOpacity 
                    style={styles.navBtn}
                    onPress={() => {
                      if (pickerMonth === 0) {
                        setPickerMonth(11);
                        setPickerYear(pickerYear - 1);
                      } else {
                        setPickerMonth(pickerMonth - 1);
                      }
                    }}
                  >
                    <Text style={styles.navBtnText}>← Prev</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthYearDisplay}>
                    {monthNames[pickerMonth]} {pickerYear}
                  </Text>
                  <TouchableOpacity 
                    style={styles.navBtn}
                    onPress={() => {
                      if (pickerMonth === 11) {
                        setPickerMonth(0);
                        setPickerYear(pickerYear + 1);
                      } else {
                        setPickerMonth(pickerMonth + 1);
                      }
                    }}
                  >
                    <Text style={styles.navBtnText}>Next →</Text>
                  </TouchableOpacity>
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                    <Text key={idx} style={styles.calendarDayHeader}>{day}</Text>
                  ))}
                  {calendarDays.map((day, idx) => {
                    const dateStr = day 
                      ? `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      : null;
                    const isSelected = dateStr === selectedDate;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.calendarDay,
                          isSelected && styles.calendarDaySelected,
                          !day && styles.calendarDayEmpty,
                        ]}
                        onPress={() => handleDaySelect(day)}
                        disabled={!day}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          isSelected && styles.calendarDayTextSelected,
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Hour Picker */}
              <View style={styles.timePickerSection}>
                <Text style={styles.sectionLabel}>Ora</Text>
                <View style={styles.hourPicker}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.hourOption,
                        selectedHour === i && styles.hourOptionActive,
                      ]}
                      onPress={() => setSelectedHour(i)}
                    >
                      <Text
                        style={[
                          styles.hourOptionText,
                          selectedHour === i && styles.hourOptionTextActive,
                        ]}
                      >
                        {String(i).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Minute Picker */}
              <View style={styles.timePickerSection}>
                <Text style={styles.sectionLabel}>Minute</Text>
                <View style={styles.minutePicker}>
                  {[0, 15, 30, 45].map((min) => (
                    <TouchableOpacity
                      key={min}
                      style={[
                        styles.minuteOption,
                        selectedMinute === min && styles.minuteOptionActive,
                      ]}
                      onPress={() => setSelectedMinute(min)}
                    >
                      <Text
                        style={[
                          styles.minuteOptionText,
                          selectedMinute === min && styles.minuteOptionTextActive,
                        ]}
                      >
                        {String(min).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Summary */}
              <View style={styles.timeSummary}>
                <Text style={styles.summaryLabel}>Rezumat:</Text>
                <Text style={styles.summaryValue}>
                  {formatDisplayDate()} la {formatDisplayTime()}
                </Text>
              </View>
            </ScrollView>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setShowDateTimePicker(false)}
            >
              <Text style={styles.confirmBtnText}>Confirma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  dateTimeRow: {
    marginBottom: 12,
  },
  dateTimeButton: {
    backgroundColor: 'rgba(255, 77, 210, 0.12)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
  },
  dateTimeLabel: {
    color: '#ff9ff3',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  dateTimeValue: {
    color: '#ff4dd2',
    fontSize: 18,
    fontWeight: '800',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0b0216',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 210, 0.15)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ff4dd2',
  },
  closeBtn: {
    fontSize: 28,
    color: '#ff9ff3',
    fontWeight: '300',
  },
  navBtn: {
    backgroundColor: 'rgba(255, 77, 210, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
  },
  navBtnText: {
    color: '#ff4dd2',
    fontWeight: '700',
    fontSize: 12,
  },
  pickerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ff4dd2',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateNavSection: {
    marginBottom: 24,
  },
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthYearDisplay: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ff4dd2',
    flex: 1,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 4,
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: '800',
    color: '#ff9ff3',
    fontSize: 13,
    paddingVertical: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 77, 210, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.2)',
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: '#ff4dd2',
    borderColor: '#ff4dd2',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d7c8ff',
  },
  calendarDayTextSelected: {
    color: '#0b0216',
  },
  dateDisplayBig: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ff9ff3',
  },
  timePickerSection: {
    marginBottom: 24,
  },
  hourPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourOption: {
    width: '23%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#12062a',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.2)',
  },
  hourOptionActive: {
    backgroundColor: '#ff4dd2',
    borderColor: '#ff4dd2',
  },
  hourOptionText: {
    color: '#d7c8ff',
    fontWeight: '700',
    fontSize: 13,
  },
  hourOptionTextActive: {
    color: '#0b0216',
  },
  minutePicker: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  minuteOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#12062a',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.2)',
  },
  minuteOptionActive: {
    backgroundColor: '#ff4dd2',
    borderColor: '#ff4dd2',
  },
  minuteOptionText: {
    color: '#d7c8ff',
    fontWeight: '700',
    fontSize: 14,
  },
  minuteOptionTextActive: {
    color: '#0b0216',
  },
  timeSummary: {
    backgroundColor: 'rgba(255, 77, 210, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.3)',
    marginBottom: 16,
  },
  summaryLabel: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  summaryValue: {
    color: '#ff4dd2',
    fontSize: 16,
    fontWeight: '800',
  },
  confirmBtn: {
    marginHorizontal: 20,
    backgroundColor: '#ff4dd2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  confirmBtnText: {
    color: '#0b0216',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default TaskInput;
