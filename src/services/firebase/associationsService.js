import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const ASSOCIATIONS_COLLECTION = 'associations';

const mapSnapshot = (snapshot) =>
  snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

export const getAllAssociations = async () => {
  try {
    const associationsRef = collection(db, ASSOCIATIONS_COLLECTION);
    const q = query(associationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return { success: true, data: mapSnapshot(snapshot) };
  } catch (error) {
    return { success: false, error: 'Error al obtener asociaciones' };
  }
};

export const getAssociationsByUser = async (userId) => {
  try {
    const associationsRef = collection(db, ASSOCIATIONS_COLLECTION);
    const q = query(
      associationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return { success: true, data: mapSnapshot(snapshot) };
  } catch (error) {
    return { success: false, error: 'Error al obtener asociaciones del usuario' };
  }
};

export const getAssociationsByProject = async (projectId) => {
  try {
    const associationsRef = collection(db, ASSOCIATIONS_COLLECTION);
    const q = query(
      associationsRef,
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return { success: true, data: mapSnapshot(snapshot) };
  } catch (error) {
    return { success: false, error: 'Error al obtener asociaciones del proyecto' };
  }
};

export const getAssociationById = async (associationId) => {
  try {
    const associationRef = doc(db, ASSOCIATIONS_COLLECTION, associationId);
    const snapshot = await getDoc(associationRef);
    if (!snapshot.exists()) {
      return { success: false, error: 'Asociación no encontrada' };
    }
    return { success: true, data: { id: snapshot.id, ...snapshot.data() } };
  } catch (error) {
    return { success: false, error: 'Error al obtener la asociación' };
  }
};

export const findAssociationByUserAndProject = async (userId, projectId) => {
  try {
    const associationsRef = collection(db, ASSOCIATIONS_COLLECTION);
    const q = query(
      associationsRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, data: null };
    }
    const [document] = mapSnapshot(snapshot);
    return { success: true, data: document };
  } catch (error) {
    return { success: false, error: 'Error al validar asociación existente' };
  }
};

export const createAssociation = async (associationData) => {
  try {
    const associationsRef = collection(db, ASSOCIATIONS_COLLECTION);
    const payload = {
      ...associationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(associationsRef, payload);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: 'Error al crear asociación' };
  }
};

export const deleteAssociation = async (associationId) => {
  try {
    const associationRef = doc(db, ASSOCIATIONS_COLLECTION, associationId);
    await deleteDoc(associationRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al eliminar asociación' };
  }
};

