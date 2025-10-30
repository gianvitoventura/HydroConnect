// src/services/MapAnnotationService.js
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebaseConfig';
import { getDocs } from 'firebase/firestore';

const ANNOTATIONS_COLLECTION = 'annotations';
const FAVORITES_COLLECTION = 'favorites';

// ============================================================================
// ANNOTAZIONI
// ============================================================================

/**
 * Crea una nuova annotazione VINCOLATA A UNA CENTRALE
 * @param {Object} annotationData - Dati annotazione
 * @param {string} annotationData.plantId - ID centrale (OBBLIGATORIO)
 * @param {string} annotationData.plantName - Nome centrale (OBBLIGATORIO)
 * @param {string} annotationData.plantType - Tipo centrale
 * @param {number} annotationData.latitude - Latitudine (da click utente)
 * @param {number} annotationData.longitude - Longitudine (da click utente)
 * @param {string} annotationData.title - Titolo annotazione
 * @param {string} annotationData.description - Descrizione
 * @param {string} annotationData.category - Categoria (general|photo|issue|suggestion)
 * @param {boolean} annotationData.isPublic - Visibilità pubblica
 * @param {File[]} annotationData.imageFiles - Array di file immagini (opzionale)
 */
export const createAnnotation = async (annotationData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Utente non autenticato');
    }

    // ✅ VALIDAZIONE: Centrale obbligatoria
    if (!annotationData.plantId || !annotationData.plantName) {
      throw new Error('Annotazione deve essere associata a una centrale');
    }

    // Upload immagini se presenti
    const imageUrls = [];
    if (annotationData.imageFiles && annotationData.imageFiles.length > 0) {
      for (const file of annotationData.imageFiles) {
        const imageUrl = await uploadAnnotationImage(file, user.uid);
        imageUrls.push(imageUrl);
      }
    }

    // Prepara documento annotazione
    const annotationDoc = {
      // Dati centrale (OBBLIGATORI)
      plantId: annotationData.plantId,
      plantName: annotationData.plantName,
      plantType: annotationData.plantType || 'unknown',
      
      // Dati annotazione
      title: annotationData.title,
      description: annotationData.description || '',
      category: annotationData.category || 'general',
      
      // Posizione (da click utente sulla mappa)
      latitude: annotationData.latitude,
      longitude: annotationData.longitude,
      
      // Utente
      userId: user.uid,
      userName: user.displayName || user.email || 'Utente Anonimo',
      userEmail: user.email || '',
      
      // Interazioni (con array likedBy per limitare a 1 like per user)
      likes: 0,
      likedBy: [], // ← NUOVO: array userId che hanno messo like
      
      // Visibilità
      isPublic: annotationData.isPublic !== false, // default true
      
      // Media
      images: imageUrls,
      
      // Timestamp
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Salva in Firestore
    const docRef = await addDoc(collection(db, ANNOTATIONS_COLLECTION), annotationDoc);
    
    console.log('✅ Annotazione creata:', docRef.id, 'per centrale:', annotationData.plantId);
    
    return {
      id: docRef.id,
      ...annotationDoc
    };

  } catch (error) {
    console.error('❌ Errore creazione annotazione:', error);
    throw error;
  }
};

/**
 * Upload immagine annotazione su Firebase Storage
 */
const uploadAnnotationImage = async (file, userId) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `annotations/${userId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Errore upload immagine:', error);
    throw error;
  }
};

/**
 * Recupera annotazioni pubbliche
 * @param {Function} callback - Callback con array annotazioni
 * @returns {Function} Unsubscribe function
 */
export const getPublicAnnotations = (callback) => {
  try {
    const q = query(
      collection(db, ANNOTATIONS_COLLECTION),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const annotations = [];
      snapshot.forEach((doc) => {
        annotations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(annotations);
    });
  } catch (error) {
    console.error('❌ Errore recupero annotazioni pubbliche:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Recupera annotazioni di uno specifico utente
 * @param {Function} callback - Callback con array annotazioni
 * @returns {Function} Unsubscribe function
 */
export const getUserAnnotations = (callback) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, ANNOTATIONS_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const annotations = [];
      snapshot.forEach((doc) => {
        annotations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(annotations);
    });
  } catch (error) {
    console.error('❌ Errore recupero annotazioni utente:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Recupera annotazioni per una specifica centrale
 * @param {string} plantId - ID della centrale
 * @param {Function} callback - Callback con array annotazioni
 * @returns {Function} Unsubscribe function
 */
export const getPlantAnnotations = (plantId, callback) => {
  try {
    if (!plantId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, ANNOTATIONS_COLLECTION),
      where('plantId', '==', plantId),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const annotations = [];
      snapshot.forEach((doc) => {
        annotations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(annotations);
    });
  } catch (error) {
    console.error('❌ Errore recupero annotazioni centrale:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Toggle like su annotazione (limitato ad 1 like per utente)
 * @param {string} annotationId - ID annotazione
 * @returns {Promise<boolean>} true se like aggiunto, false se rimosso
 */
export const likeAnnotation = async (annotationId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login per mettere like');
    }

    const annotationRef = doc(db, ANNOTATIONS_COLLECTION, annotationId);
    const annotationSnap = await getDoc(annotationRef);

    if (!annotationSnap.exists()) {
      throw new Error('Annotazione non trovata');
    }

    const annotationData = annotationSnap.data();
    const likedBy = annotationData.likedBy || [];
    const userHasLiked = likedBy.includes(user.uid);

    if (userHasLiked) {
      // ❌ Rimuovi like
      await updateDoc(annotationRef, {
        likes: increment(-1),
        likedBy: arrayRemove(user.uid),
        updatedAt: Timestamp.now()
      });
      console.log('👎 Like rimosso da:', annotationId);
      return false;
    } else {
      // ✅ Aggiungi like
      await updateDoc(annotationRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid),
        updatedAt: Timestamp.now()
      });
      console.log('👍 Like aggiunto a:', annotationId);
      return true;
    }
  } catch (error) {
    console.error('❌ Errore gestione like:', error);
    throw error;
  }
};

/**
 * Verifica se utente corrente ha già messo like
 * @param {string[]} likedBy - Array di userId che hanno messo like
 * @returns {boolean} true se utente ha già messo like
 */
export const hasUserLiked = (likedBy = []) => {
  const user = auth.currentUser;
  if (!user) return false;
  return likedBy.includes(user.uid);
};

/**
 * Elimina annotazione (solo proprietario)
 * @param {string} annotationId - ID annotazione
 */
export const deleteAnnotation = async (annotationId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login per eliminare annotazioni');
    }

    const annotationRef = doc(db, ANNOTATIONS_COLLECTION, annotationId);
    const annotationSnap = await getDoc(annotationRef);

    if (!annotationSnap.exists()) {
      throw new Error('Annotazione non trovata');
    }

    const annotationData = annotationSnap.data();
    
    // Verifica proprietà
    if (annotationData.userId !== user.uid) {
      throw new Error('Non hai i permessi per eliminare questa annotazione');
    }

    // Elimina documento
    await deleteDoc(annotationRef);
    
    // TODO: Eliminare anche immagini da Storage se necessario
    // for (const imageUrl of annotationData.images || []) {
    //   await deleteImageFromStorage(imageUrl);
    // }

    console.log('🗑️ Annotazione eliminata:', annotationId);
  } catch (error) {
    console.error('❌ Errore eliminazione annotazione:', error);
    throw error;
  }
};

/**
 * Aggiorna annotazione (solo proprietario)
 * @param {string} annotationId - ID annotazione
 * @param {Object} updates - Campi da aggiornare
 */
export const updateAnnotation = async (annotationId, updates) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login per modificare annotazioni');
    }

    const annotationRef = doc(db, ANNOTATIONS_COLLECTION, annotationId);
    const annotationSnap = await getDoc(annotationRef);

    if (!annotationSnap.exists()) {
      throw new Error('Annotazione non trovata');
    }

    const annotationData = annotationSnap.data();
    
    // Verifica proprietà
    if (annotationData.userId !== user.uid) {
      throw new Error('Non hai i permessi per modificare questa annotazione');
    }

    // Aggiorna solo campi permessi
    const allowedUpdates = {
      title: updates.title,
      description: updates.description,
      category: updates.category,
      isPublic: updates.isPublic,
      updatedAt: Timestamp.now()
    };

    // Rimuovi campi undefined
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    await updateDoc(annotationRef, allowedUpdates);
    
    console.log('✏️ Annotazione aggiornata:', annotationId);
  } catch (error) {
    console.error('❌ Errore aggiornamento annotazione:', error);
    throw error;
  }
};

// ============================================================================
// PREFERITI (manteniamo la logica esistente)
// ============================================================================

/**
 * Recupera preferiti utente
 */
export const getUserFavorites = (callback) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, FAVORITES_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const favorites = [];
      snapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(favorites);
    });
  } catch (error) {
    console.error('❌ Errore recupero preferiti:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Aggiungi centrale ai preferiti
 */
export const addFavoritePlant = async (plantId, plantData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login');
    }

    const favoriteDoc = {
      userId: user.uid,
      plantId: plantId,
      plantName: plantData.name,
      plantType: plantData.type || 'unknown',
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, FAVORITES_COLLECTION), favoriteDoc);
    console.log('⭐ Preferito aggiunto:', plantId);
  } catch (error) {
    console.error('❌ Errore aggiunta preferito:', error);
    throw error;
  }
};

/**
 * Rimuovi centrale dai preferiti
 */
export const removeFavoritePlant = async (plantId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login');
    }

    const q = query(
      collection(db, FAVORITES_COLLECTION),
      where('userId', '==', user.uid),
      where('plantId', '==', plantId)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log('🗑️ Preferito rimosso:', plantId);
  } catch (error) {
    console.error('❌ Errore rimozione preferito:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY
// ============================================================================

/**
 * Conta annotazioni per centrale
 */
export const getAnnotationCount = async (plantId) => {
  try {
    const q = query(
      collection(db, ANNOTATIONS_COLLECTION),
      where('plantId', '==', plantId),
      where('isPublic', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Errore conteggio annotazioni:', error);
    return 0;
  }
};

