// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // ← NUOVO

const firebaseConfig = {
  apiKey: "AIzaSyBFXX2qAxVz4_juMz4ZowAchfylt-BqfYc",
  authDomain: "hydroconnect-3463a.firebaseapp.com",
  projectId: "hydroconnect-3463a",
  storageBucket: "hydroconnect-3463a.firebasestorage.app",
  messagingSenderId: "801279377307",
  appId: "1:801279377307:web:9b24001dfa34293dd86b3e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // ← NUOVO

export default app;