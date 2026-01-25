import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAc0UfFYH9Sa0r27aLxcxd3JPu9l0c9EGA",
  authDomain: "finnysights.firebaseapp.com",
  projectId: "finnysights",
  storageBucket: "finnysights.firebasestorage.app",
  messagingSenderId: "1068318520098",
  appId: "1:1068318520098:web:ccb1e4cadf011aa31a2b7b",
  measurementId: "G-G75FHWVN20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
