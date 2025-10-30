// src/services/UserService.js
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Crea o aggiorna il profilo utente in Firestore
 * Da chiamare dopo la registrazione o al primo login
 */
export const createUserProfile = async (user) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  
  try {
    // Controlla se il profilo esiste già
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Crea nuovo profilo utente
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Utente Anonimo',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        // Dati aggiuntivi opzionali
        role: 'user', // 'user', 'admin', ecc.
        projectsCreated: 0,
        votesGiven: 0,
        hydrokidsCompleted: false
      });
      
      console.log('✅ Profilo utente creato in Firestore');
    } else {
      // Aggiorna ultimo login
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Ultimo login aggiornato');
    }
  } catch (error) {
    console.error('❌ Errore creazione profilo utente:', error);
    throw error;
  }
};

/**
 * Ottiene il profilo utente da Firestore
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('❌ Errore lettura profilo:', error);
    return null;
  }
};

/**
 * Aggiorna statistiche utente
 */
export const updateUserStats = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, updates, { merge: true });
    console.log('✅ Statistiche utente aggiornate');
  } catch (error) {
    console.error('❌ Errore aggiornamento stats:', error);
  }
};

export default {
  createUserProfile,
  getUserProfile,
  updateUserStats
};