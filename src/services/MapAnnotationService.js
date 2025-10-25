// src/services/mapAnnotationsService.js
import { db, auth, storage } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Servizio per gestire le annotazioni sulla mappa
 * Le annotazioni possono essere:
 * - Note testuali su un punto specifico
 * - Foto con coordinate
 * - Percorsi GPS salvati
 * - Centrali preferite
 */

const COLLECTIONS = {
  ANNOTATIONS: 'mapAnnotations',
  FAVORITES: 'favoritePlants',
  GPS_TRACKS: 'gpsTrackes'
};

// ==================== ANNOTAZIONI ====================

/**
 * Crea una nuova annotazione sulla mappa
 */
export const createAnnotation = async (annotationData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login per creare annotazioni');
    }

    const annotation = {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'Utente Anonimo',
      latitude: annotationData.latitude,
      longitude: annotationData.longitude,
      title: annotationData.title || '',
      description: annotationData.description || '',
      category: annotationData.category || 'general', // general, photo, issue, suggestion
      plantId: annotationData.plantId || null, // Se associata a una centrale
      isPublic: annotationData.isPublic !== undefined ? annotationData.isPublic : true,
      images: [], // Array di URL immagini
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      comments: []
    };

    // Upload immagini se presenti
    if (annotationData.imageFiles && annotationData.imageFiles.length > 0) {
      annotation.images = await uploadAnnotationImages(annotationData.imageFiles, user.uid);
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.ANNOTATIONS), annotation);
    
    return {
      id: docRef.id,
      ...annotation
    };
  } catch (error) {
    console.error('Errore creazione annotazione:', error);
    throw error;
  }
};

/**
 * Carica immagini per un'annotazione
 */
const uploadAnnotationImages = async (imageFiles, userId) => {
  const uploadPromises = imageFiles.map(async (file) => {
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `mapAnnotations/${userId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  });

  return await Promise.all(uploadPromises);
};

/**
 * Ottieni tutte le annotazioni pubbliche
 */
export const getPublicAnnotations = (callback) => {
  const q = query(
    collection(db, COLLECTIONS.ANNOTATIONS),
    where('isPublic', '==', true)
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
};

/**
 * Ottieni annotazioni dell'utente corrente
 */
export const getUserAnnotations = (callback) => {
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(
    collection(db, COLLECTIONS.ANNOTATIONS),
    where('userId', '==', user.uid)
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
};

/**
 * Ottieni annotazioni per una centrale specifica
 */
export const getPlantAnnotations = (plantId, callback) => {
  const q = query(
    collection(db, COLLECTIONS.ANNOTATIONS),
    where('plantId', '==', plantId),
    where('isPublic', '==', true)
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
};

/**
 * Aggiorna un'annotazione
 */
export const updateAnnotation = async (annotationId, updates) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login');
    }

    const annotationRef = doc(db, COLLECTIONS.ANNOTATIONS, annotationId);
    await updateDoc(annotationRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Errore aggiornamento annotazione:', error);
    throw error;
  }
};

/**
 * Elimina un'annotazione
 */
export const deleteAnnotation = async (annotationId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login');
    }

    const annotationRef = doc(db, COLLECTIONS.ANNOTATIONS, annotationId);
    await deleteDoc(annotationRef);

    return true;
  } catch (error) {
    console.error('Errore eliminazione annotazione:', error);
    throw error;
  }
};

/**
 * Aggiungi like a un'annotazione
 */
export const likeAnnotation = async (annotationId) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const annotationRef = doc(db, COLLECTIONS.ANNOTATIONS, annotationId);
    
    // Qui dovresti controllare se l'utente ha già messo like
    // Per semplicità incrementiamo direttamente
    const annotationDoc = await getDocs(query(collection(db, COLLECTIONS.ANNOTATIONS), where('__name__', '==', annotationId)));
    if (!annotationDoc.empty) {
      const currentLikes = annotationDoc.docs[0].data().likes || 0;
      await updateDoc(annotationRef, {
        likes: currentLikes + 1
      });
    }

    return true;
  } catch (error) {
    console.error('Errore like annotazione:', error);
    throw error;
  }
};

// ==================== CENTRALI PREFERITE ====================

/**
 * Aggiungi centrale ai preferiti
 */
export const addFavoritePlant = async (plantId, plantData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login');
    }

    const favorite = {
      userId: user.uid,
      plantId: plantId,
      plantName: plantData.name,
      plantType: plantData.type,
      coordinates: plantData.coordinates,
      addedAt: serverTimestamp()
    };

    await addDoc(collection(db, COLLECTIONS.FAVORITES), favorite);
    return true;
  } catch (error) {
    console.error('Errore aggiunta preferito:', error);
    throw error;
  }
};

/**
 * Rimuovi centrale dai preferiti
 */
export const removeFavoritePlant = async (plantId) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, COLLECTIONS.FAVORITES),
      where('userId', '==', user.uid),
      where('plantId', '==', plantId)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return true;
  } catch (error) {
    console.error('Errore rimozione preferito:', error);
    throw error;
  }
};

/**
 * Ottieni centrali preferite dell'utente
 */
export const getUserFavorites = (callback) => {
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(
    collection(db, COLLECTIONS.FAVORITES),
    where('userId', '==', user.uid)
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
};

/**
 * Controlla se una centrale è nei preferiti
 */
export const isPlantFavorite = async (plantId) => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const q = query(
      collection(db, COLLECTIONS.FAVORITES),
      where('userId', '==', user.uid),
      where('plantId', '==', plantId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Errore controllo preferito:', error);
    return false;
  }
};

// ==================== PERCORSI GPS ====================

/**
 * Salva un percorso GPS
 */
export const saveGPSTrack = async (trackData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login');
    }

    const track = {
      userId: user.uid,
      userName: user.displayName || 'Utente Anonimo',
      name: trackData.name || 'Percorso senza nome',
      description: trackData.description || '',
      coordinates: trackData.coordinates, // Array di {lat, lng, timestamp}
      distance: trackData.distance || 0, // in metri
      duration: trackData.duration || 0, // in secondi
      startTime: trackData.startTime,
      endTime: trackData.endTime,
      isPublic: trackData.isPublic !== undefined ? trackData.isPublic : false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.GPS_TRACKS), track);
    
    return {
      id: docRef.id,
      ...track
    };
  } catch (error) {
    console.error('Errore salvataggio percorso GPS:', error);
    throw error;
  }
};

/**
 * Ottieni percorsi GPS dell'utente
 */
export const getUserGPSTracks = (callback) => {
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(
    collection(db, COLLECTIONS.GPS_TRACKS),
    where('userId', '==', user.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const tracks = [];
    snapshot.forEach((doc) => {
      tracks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(tracks);
  });
};

/**
 * Ottieni percorsi GPS pubblici
 */
export const getPublicGPSTracks = (callback) => {
  const q = query(
    collection(db, COLLECTIONS.GPS_TRACKS),
    where('isPublic', '==', true)
  );

  return onSnapshot(q, (snapshot) => {
    const tracks = [];
    snapshot.forEach((doc) => {
      tracks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(tracks);
  });
};

/**
 * Elimina un percorso GPS
 */
export const deleteGPSTrack = async (trackId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Devi effettuare il login');
    }

    const trackRef = doc(db, COLLECTIONS.GPS_TRACKS, trackId);
    await deleteDoc(trackRef);

    return true;
  } catch (error) {
    console.error('Errore eliminazione percorso:', error);
    throw error;
  }
};

export default {
  // Annotazioni
  createAnnotation,
  getPublicAnnotations,
  getUserAnnotations,
  getPlantAnnotations,
  updateAnnotation,
  deleteAnnotation,
  likeAnnotation,
  
  // Preferiti
  addFavoritePlant,
  removeFavoritePlant,
  getUserFavorites,
  isPlantFavorite,
  
  // GPS
  saveGPSTrack,
  getUserGPSTracks,
  getPublicGPSTracks,
  deleteGPSTrack
};