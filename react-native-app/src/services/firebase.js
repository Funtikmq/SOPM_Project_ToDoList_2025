import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurația Firebase - înlocuiește cu datele tale din Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDEMO_KEY_REPLACE_THIS",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

let auth;
let db;

try {
  // Inițializare Firebase
  const app = initializeApp(firebaseConfig);

  // Inițializare Authentication cu persistență AsyncStorage pentru React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });

  // Inițializare Firestore
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization warning:', error.code);
}

export { auth, db };
