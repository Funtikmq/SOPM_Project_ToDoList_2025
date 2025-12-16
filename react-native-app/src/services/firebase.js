import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurația Firebase - folosim aceleași credențiale ca aplicația web
const firebaseConfig = {
  apiKey: "AIzaSyDLOTBGjzp3WtHrlkBvIS7Uz8Lsxm8XezA",
  authDomain: "sopmtodolist2025.firebaseapp.com",
  projectId: "sopmtodolist2025",
  storageBucket: "sopmtodolist2025.appspot.com",
  messagingSenderId: "784546765700",
  appId: "1:784546765700:web:8caf105ed5bd5ea311dbd1"
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
  console.warn('Firebase initialization warning:', error?.message || error?.code || error);
}

// Authentication functions
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const registerWithEmail = async (email, password, displayName = '') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save user info to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
      createdAt: new Date().toISOString(),
      provider: 'email'
    });
    
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const loginWithGoogle = async (idToken) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    
    // Check if user already exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // New user - save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
        createdAt: new Date().toISOString(),
        provider: 'google'
      });
    }
    
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export { auth, db };
