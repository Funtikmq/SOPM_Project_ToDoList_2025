import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLOTBGjzp3WtHrlkBvIS7Uz8Lsxm8XezA",
  authDomain: "sopmtodolist2025.firebaseapp.com",
  projectId: "sopmtodolist2025",
  // Use default Firebase storage bucket to allow uploads (attachments in comments)
  storageBucket: "sopmtodolist2025.appspot.com",
  messagingSenderId: "784546765700",
  appId: "1:784546765700:web:8caf105ed5bd5ea311dbd1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
