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

// Obtener todos los favoritos de un usuario (solo IDs, sin relación)
export const getUserFavorites = async (userId) => {
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar por fecha de creación (más recientes primero)
    favorites.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return { success: true, data: favorites };
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return { success: false, error: 'Error al obtener favoritos' };
  }
};

// Agregar proyecto a favoritos (solo guarda IDs, no el proyecto completo)
export const addFavorite = async (userId, projectId) => {
  try {
    // Normalizar projectId
    const normalizedProjectId = typeof projectId === 'string' ? projectId : projectId?.id || projectId;
    
    if (!normalizedProjectId) {
      return { success: false, error: 'ID de proyecto inválido' };
    }

    // Verificar si ya existe
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
    
    // Agregar a favoritos (solo IDs y fecha)
    const favoriteData = {
      userId,
      projectId: normalizedProjectId,
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(favoritesRef, favoriteData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    return { success: false, error: 'Error al agregar favorito' };
  }
};

// Eliminar proyecto de favoritos
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
    
    // Eliminar el favorito
    const batch = [];
    querySnapshot.forEach((doc) => {
      batch.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    return { success: false, error: 'Error al eliminar favorito' };
  }
};

// Verificar si un proyecto está en favoritos
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
    console.error('Error al verificar favorito:', error);
    return false;
  }
};

// Eliminar todos los favoritos de un usuario
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
    console.error('Error al limpiar favoritos:', error);
    return { success: false, error: 'Error al limpiar favoritos' };
  }
};

