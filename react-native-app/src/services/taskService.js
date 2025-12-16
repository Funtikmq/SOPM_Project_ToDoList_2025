import { Alert } from 'react-native';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Minimal Firebase init (safe if already initialized elsewhere)
let app, db;
try {
  const firebaseConfig = global.firebaseConfig || null;
  if (firebaseConfig && !app) {
    app = initializeApp(firebaseConfig);
    initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    db = getFirestore(app);
  }
} catch (e) {
  // Fallback to mock when init fails
  db = null;
}

export async function saveTask(task) {
  // If Firestore available, save; else update mock
  const payload = { ...task };
  if (db) {
    try {
      const id = payload.id || Math.random().toString(36).substr(2, 9);
      payload.id = id;
      await setDoc(doc(db, 'tasks', id), payload, { merge: true });
      return payload;
    } catch (err) {
      Alert.alert('Eroare', 'Salvarea în Firebase a eșuat. Se va folosi modul local.');
    }
  }
  // Local mock fallback
  return payload;
}
