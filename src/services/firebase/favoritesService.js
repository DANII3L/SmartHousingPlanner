import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const FAVORITES_COLLECTION = 'favorites';

export const getUserFavorites = async (userId) => {
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push({ id: doc.id, ...doc.data() });
    });
    
    favorites.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return { success: true, data: favorites };
  } catch (error) {
    return { success: false, error: 'Error al obtener favoritos' };
  }
};

export const addFavorite = async (userId, projectId) => {
  try {
    const normalizedProjectId = typeof projectId === 'string' ? projectId : projectId?.id || projectId;
    
    if (!normalizedProjectId) {
      return { success: false, error: 'ID de proyecto inválido' };
    }

    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('projectId', '==', normalizedProjectId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, error: 'El proyecto ya está en favoritos' };
    }
    
    const favoriteData = {
      userId,
      projectId: normalizedProjectId,
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(favoritesRef, favoriteData);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: 'Error al agregar favorito' };
  }
};

export const removeFavorite = async (userId, projectId) => {
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'Favorito no encontrado' };
    }
    
    const batch = [];
    querySnapshot.forEach((doc) => {
      batch.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al eliminar favorito' };
  }
};

export const isFavorite = async (userId, projectId) => {
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    return false;
  }
};

export const clearUserFavorites = async (userId) => {
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const batch = [];
    querySnapshot.forEach((doc) => {
      batch.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al limpiar favoritos' };
  }
};

