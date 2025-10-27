// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Configurazione Firebase usando variabili d'ambiente
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validazione: verifica che tutte le variabili siano definite
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variabili d\'ambiente Firebase mancanti:', missingVars);
  throw new Error(
    `Configurazione Firebase incompleta. Variabili mancanti: ${missingVars.join(', ')}\n` +
    'Assicurati di aver creato il file .env nella root del progetto.'
  );
}

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza i servizi Firebase PRIMA di esportarli
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Esporta i servizi Firebase (DOPO averli inizializzati)
export { db, storage, auth };

// Export default dell'app
export default app;