import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLOTBGjzp3WtHrlkBvIS7Uz8Lsxm8XezA",
  authDomain: "sopmtodolist2025.firebaseapp.com",
  projectId: "sopmtodolist2025",
  storageBucket: "sopmtodolist2025.firebasestorage.app",
  messagingSenderId: "784546765700",
  appId: "1:784546765700:web:8caf105ed5bd5ea311dbd1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
