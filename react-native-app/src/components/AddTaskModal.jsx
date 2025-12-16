import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const PRIORITIES = ['Low','Medium','High'];
const TAG_OPTIONS = ['Work','Personal','Urgent','Later'];

export default function AddTaskModal({ visible, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const monthNames = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    // Adjust for Monday-first week: 0 (Sun) → 6, 1 (Mon) → 0, ..., 6 (Sat) → 5
    return day === 0 ? 6 : day - 1;
  };
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(pickerMonth, pickerYear);
    const firstDay = getFirstDayOfMonth(pickerMonth, pickerYear);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };
  const calendarDays = generateCalendarDays();
  const handleDaySelect = (day) => {
    if (!day) return;
    const dateStr = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDueDate(dateStr);
  };
  const [priority, setPriority] = useState('Medium');
  const [tags, setTags] = useState([]);
  const [recType, setRecType] = useState('none');
  const [recInterval, setRecInterval] = useState('1');
  const [recWeekdays, setRecWeekdays] = useState([]);
  const [recMonthday, setRecMonthday] = useState('');
  const [recEndDate, setRecEndDate] = useState('');

  const toggleTag = (t) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const toggleWeekday = (d) => {
    setRecWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleSave = () => {
    if (!title.trim()) {
      return; // Validation handled visually
    }
    const task = {
      title: title.trim(),
      description: description.trim(),
      subtasks,
      createdAt: new Date().toISOString(),
      dueDate,
      priority,
      tags,
      recurring: recType === 'none' ? { isRecurring: false } : {
        isRecurring: true,
        type: recType,
        interval: Math.max(1, parseInt(recInterval || '1', 10)),
        byWeekday: recType === 'weekly' ? recWeekdays : undefined,
        byMonthday: recType === 'monthly' ? Math.max(1, Math.min(31, parseInt(recMonthday || '1', 10))) : undefined,
        endDate: recEndDate || undefined,
      },
    };
    onSave(task);
    onClose();
    // reset fields
    setTitle(''); setDescription(''); setDueDate(new Date().toISOString().split('T')[0]);
    setPriority('Medium'); setTags([]); setRecType('none'); setRecInterval('1'); setRecWeekdays([]); setRecMonthday(''); setRecEndDate(''); setSubtasks([]); setSubtaskInput('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Adaugă Task</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ paddingHorizontal: 20 }}>
            <Text style={styles.label}>Titlu task *</Text>
            <TextInput style={[styles.input, !title.trim() && styles.inputError]} placeholder="Titlu" placeholderTextColor="#8d7aac" value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Descriere</Text>
            <TextInput style={[styles.input, styles.multiline]} multiline numberOfLines={3} placeholder="Descriere" placeholderTextColor="#8d7aac" value={description} onChangeText={setDescription} />

            <Text style={styles.label}>Subtask-uri</Text>
            <View style={styles.rowBetween}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Adaugă subtask"
                placeholderTextColor="#8d7aac"
                value={subtaskInput}
                onChangeText={setSubtaskInput}
              />
              <TouchableOpacity
                style={[styles.smallBtn, { paddingVertical: 10 }]} 
                onPress={() => {
                  const t = subtaskInput.trim();
                  if (!t) return;
                  setSubtasks((prev) => [...prev, { title: t, done: false }]);
                  setSubtaskInput('');
                }}
              >
                <Text style={styles.smallBtnText}>Adaugă</Text>
              </TouchableOpacity>
            </View>
            {subtasks.length > 0 && (
              <View style={[styles.box, { marginTop: 8 }]}> 
                {subtasks.map((st, idx) => (
                  <View key={idx} style={styles.rowBetween}>
                    <Text style={{ color: '#d7c8ff', fontWeight: '700' }}>{st.title}</Text>
                    <TouchableOpacity
                      style={styles.smallGhost}
                      onPress={() => setSubtasks((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Text style={styles.smallGhostText}>Șterge</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.label}>Data</Text>
            <View style={styles.dateNavRow}>
              <TouchableOpacity 
                style={styles.navBtn}
                onPress={() => {
                  if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(pickerYear - 1); }
                  else { setPickerMonth(pickerMonth - 1); }
                }}
              >
                <Text style={styles.navBtnText}>← Prev</Text>
              </TouchableOpacity>
              <Text style={styles.monthYearDisplay}>{monthNames[pickerMonth]} {pickerYear}</Text>
              <TouchableOpacity 
                style={styles.navBtn}
                onPress={() => {
                  if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(pickerYear + 1); }
                  else { setPickerMonth(pickerMonth + 1); }
                }}
              >
                <Text style={styles.navBtnText}>Next →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
              {['L','M','M','J','V','S','D'].map((d, idx) => (
                <Text key={idx} style={styles.calendarDayHeader}>{d}</Text>
              ))}
              {calendarDays.map((day, idx) => {
                const dateStr = day ? `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                const isSelected = dateStr === dueDate;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.calendarDay, isSelected && styles.calendarDaySelected, !day && styles.calendarDayEmpty]}
                    onPress={() => handleDaySelect(day)}
                    disabled={!day}
                  >
                    <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Prioritate</Text>
            <View style={styles.rowWrap}>
              {PRIORITIES.map((p) => {
                const active = priority === p;
                return (
                  <TouchableOpacity key={p} style={[styles.chip, active && styles.chipActive]} onPress={() => setPriority(p)}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Tag-uri</Text>
            <View style={styles.rowWrap}>
              {TAG_OPTIONS.map((t) => {
                const active = tags.includes(t);
                return (
                  <TouchableOpacity key={t} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleTag(t)}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Recurență</Text>
            <View style={styles.rowWrap}>
              {['none','daily','weekly','monthly'].map((t) => {
                const active = recType === t;
                return (
                  <TouchableOpacity key={t} style={[styles.chip, active && styles.chipActive]} onPress={() => setRecType(t)}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.toUpperCase()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {recType !== 'none' && (
              <View style={styles.box}>
                <View style={styles.rowBetween}>
                  <Text style={styles.boxLabel}>Interval</Text>
                  <TextInput style={styles.boxInput} value={recInterval} onChangeText={setRecInterval} keyboardType="number-pad" placeholder="1" placeholderTextColor="#8d7aac" />
                </View>
                {recType === 'weekly' && (
                  <View style={[styles.rowWrap,{ marginTop: 8 }]}> 
                    {['mon','tue','wed','thu','fri','sat','sun'].map((d) => {
                      const active = recWeekdays.includes(d);
                      return (
                        <TouchableOpacity key={d} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleWeekday(d)}>
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.toUpperCase()}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                {recType === 'monthly' && (
                  <View style={styles.rowBetween}>
                    <Text style={styles.boxLabel}>Zi din lună</Text>
                    <TextInput style={styles.boxInput} value={recMonthday} onChangeText={setRecMonthday} keyboardType="number-pad" placeholder="1-31" placeholderTextColor="#8d7aac" />
                  </View>
                )}
                <View style={styles.rowBetween}>
                  <Text style={styles.boxLabel}>End date</Text>
                  <Text style={styles.endValue}>{recEndDate || 'None'}</Text>
                </View>
                <View style={styles.rowWrap}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => { const d = new Date(); d.setDate(d.getDate()+30); setRecEndDate(d.toISOString().split('T')[0]); }}>
                    <Text style={styles.smallBtnText}>+30 zile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => { const d = new Date(); d.setDate(d.getDate()+365); setRecEndDate(d.toISOString().split('T')[0]); }}>
                    <Text style={styles.smallBtnText}>+1 an</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallGhost} onPress={() => setRecEndDate('')}>
                    <Text style={styles.smallGhostText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveText}>Salvează</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelText}>Anulează</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0b0216', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 77, 210, 0.15)' },
  title: { color: '#ff4dd2', fontSize: 18, fontWeight: '800' },
  close: { color: '#ff9ff3', fontSize: 22 },
  label: { color: '#a78bfa', fontSize: 12, fontWeight: '700', marginTop: 12 },
  input: { backgroundColor: '#140a2e', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 77, 210, 0.25)', paddingHorizontal: 12, paddingVertical: 10, color: '#fef0ff' },
    dateNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    monthYearDisplay: { fontSize: 16, fontWeight: '800', color: '#ff4dd2', flex: 1, textAlign: 'center' },
    navBtn: { backgroundColor: 'rgba(255, 77, 210, 0.15)', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 77, 210, 0.3)' },
    navBtnText: { color: '#ff4dd2', fontWeight: '700', fontSize: 12 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    calendarDayHeader: { width: '14.2%', textAlign: 'center', fontWeight: '800', color: '#ff9ff3', fontSize: 13, paddingVertical: 8 },
    calendarDay: { width: '14.2%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'rgba(255, 77, 210, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 77, 210, 0.2)', marginVertical: 2 },
    calendarDayEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
    calendarDaySelected: { backgroundColor: '#ff4dd2', borderColor: '#ff4dd2' },
    calendarDayText: { fontSize: 14, fontWeight: '700', color: '#d7c8ff' },
    calendarDayTextSelected: { color: '#0b0216' },
  inputError: { borderColor: '#ff4d4d' },
  multiline: { height: 70 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 77, 210, 0.25)', backgroundColor: '#140a2e' },
  chipActive: { backgroundColor: '#ff4dd2', borderColor: '#ff4dd2' },
  chipText: { color: '#d7c8ff', fontWeight: '700' },
  chipTextActive: { color: '#0b0216', fontWeight: '800' },
  box: { marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: '#12062a', borderWidth: 1, borderColor: 'rgba(255, 77, 210, 0.25)' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  boxLabel: { color: '#fef0ff', fontWeight: '700' },
  boxInput: { width: 90, backgroundColor: '#140a2e', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 77, 210, 0.25)', paddingHorizontal: 10, paddingVertical: 8, color: '#fef0ff', textAlign: 'center' },
  endValue: { color: '#d7c8ff', fontWeight: '600' },
  smallBtn: { backgroundColor: '#ff4dd2', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  smallBtnText: { color: '#0b0216', fontWeight: '800' },
  smallGhost: { borderWidth: 1, borderColor: 'rgba(255, 77, 210, 0.35)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#140a2e' },
  smallGhostText: { color: '#ffb8f6', fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(255, 77, 210, 0.15)' },
  saveBtn: { flex: 1, backgroundColor: '#ff4dd2', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveText: { color: '#0b0216', fontWeight: '800' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: 'rgba(255, 77, 210, 0.35)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#140a2e' },
  cancelText: { color: '#ffb8f6', fontWeight: '700' },
});
