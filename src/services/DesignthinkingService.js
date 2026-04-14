// src/services/designThinkingService.js
import { db, auth } from '../firebaseConfig';
import { 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Servizio per gestire i progressi del Design Thinking Workshop
 * Salva automaticamente i progressi dell'utente per ogni fase
 */

const COLLECTION = 'designThinking';

/**
 * Salva o aggiorna i progressi del workshop
 */
export const saveWorkshopProgress = async (progressData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login per salvare i progressi');
    }

    const userDocRef = doc(db, COLLECTION, user.uid);
    
    // Prepara i dati da salvare
    const data = {
      userId: user.uid,
      userEmail: user.email,
      empathize: progressData.empathize || '',
      define: progressData.define || '',
      ideate: progressData.ideate || '',
      prototype: progressData.prototype || '',
      test: progressData.test || '',
      summary: progressData.summary || '',
      lastUpdated: serverTimestamp(),
      completionPercentage: calculateCompletion(progressData)
    };

    // Controlla se esiste già un documento
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      // Aggiorna documento esistente
      await updateDoc(userDocRef, data);
    } else {
      // Crea nuovo documento
      await setDoc(userDocRef, {
        ...data,
        createdAt: serverTimestamp()
      });
    }

    return true;
  } catch (error) {
    console.error('Errore salvataggio progressi workshop:', error);
    throw error;
  }
};

/**
 * Carica i progressi salvati dell'utente
 */
export const loadWorkshopProgress = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    const userDocRef = doc(db, COLLECTION, user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    return null;
  } catch (error) {
    console.error('Errore caricamento progressi workshop:', error);
    throw error;
  }
};

/**
 * Reset dei progressi (ricomincia da capo)
 */
export const resetWorkshopProgress = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login');
    }

    const userDocRef = doc(db, COLLECTION, user.uid);
    await deleteDoc(userDocRef);

    return true;
  } catch (error) {
    console.error('Errore reset progressi workshop:', error);
    throw error;
  }
};

/**
 * Auto-save con debounce
 * Salva automaticamente dopo 2 secondi di inattività
 */
let autoSaveTimeout = null;

export const autoSaveWorkshopProgress = (progressData) => {
  // Cancella il timeout precedente
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Imposta nuovo timeout
  autoSaveTimeout = setTimeout(async () => {
    try {
      await saveWorkshopProgress(progressData);
      console.log('✅ Progressi salvati automaticamente');
    } catch (error) {
      console.error('❌ Errore auto-save:', error);
    }
  }, 2000); // 2 secondi di debounce
};

/**
 * Calcola percentuale completamento
 */
const calculateCompletion = (data) => {
  const fields = ['empathize', 'define', 'ideate', 'prototype', 'test'];
  const completed = fields.filter(field => data[field] && data[field].trim().length > 0).length;
  return Math.round((completed / fields.length) * 100);
};

/**
 * Ottieni statistiche globali del workshop
 * (quanti utenti hanno completato, percentuale media, etc.)
 */
export const getWorkshopStatistics = async () => {
    return {
      totalUsers: 0,
      averageCompletion: 0,
      completedUsers: 0
  }
};

const DesignthinkingService = {
  saveWorkshopProgress,
  loadWorkshopProgress,
  resetWorkshopProgress,
  autoSaveWorkshopProgress,
  getWorkshopStatistics
};

export default DesignthinkingService;