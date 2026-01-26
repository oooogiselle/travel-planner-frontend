// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// TODO: Replace with your Firebase project credentials
// Get these from: https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "AIzaSyBL5lIrRHECAq1Ag3e9-nbb2aecpEgIS60",
  authDomain: "trip-90cdb.firebaseapp.com",
  projectId: "trip-90cdb",
  storageBucket: "trip-90cdb.firebasestorage.app",
  messagingSenderId: "397430373908",
  appId: "1:397430373908:web:1186cb778bae946d9ef101",
  measurementId: "G-XD8ND1DKZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;