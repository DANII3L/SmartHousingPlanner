import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const SIMULATIONS_COLLECTION = 'simulations';

// Obtener todas las simulaciones de un usuario
export const getUserSimulations = async (userId) => {
  try {
    if (!userId) {
      console.error('userId no proporcionado');
      return { success: false, error: 'userId es requerido' };
    }

    const simulationsRef = collection(db, SIMULATIONS_COLLECTION);
    
    // Buscar sin orderBy primero para evitar problemas con índices compuestos
    // Si hay un índice compuesto, se puede agregar orderBy después
    let q = query(
      simulationsRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const simulations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      simulations.push({ id: doc.id, ...data });
    });
    
    simulations.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA; // Más recientes primero
    });
    return { success: true, data: simulations };
  } catch (error) {
    console.error('Error al obtener simulaciones:', error);
    console.error('Error details:', error.message, error.code);
    return { success: false, error: error.message || 'Error al obtener simulaciones' };
  }
};

// Obtener simulación por ID
export const getSimulationById = async (simulationId) => {
  try {
    const simulationRef = doc(db, SIMULATIONS_COLLECTION, simulationId);
    const simulationSnap = await getDoc(simulationRef);
    
    if (simulationSnap.exists()) {
      return { success: true, data: { id: simulationSnap.id, ...simulationSnap.data() } };
    } else {
      return { success: false, error: 'Simulación no encontrada' };
    }
  } catch (error) {
    console.error('Error al obtener simulación:', error);
    return { success: false, error: 'Error al obtener simulación' };
  }
};

// Obtener simulación por proyecto
export const getSimulationByProject = async (userId, projectId) => {
  try {
    const simulationsRef = collection(db, SIMULATIONS_COLLECTION);
    const q = query(
      simulationsRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } else {
      return { success: false, data: null };
    }
  } catch (error) {
    console.error('Error al obtener simulación por proyecto:', error);
    return { success: false, error: 'Error al obtener simulación' };
  }
};

// Guardar o actualizar simulación
export const saveSimulation = async (userId, simulationData) => {
  try {
    const { projectId } = simulationData;
    
    // Verificar si ya existe una simulación para este proyecto
    const existingSim = await getSimulationByProject(userId, projectId);
    
    if (existingSim.success && existingSim.data) {
      // Actualizar simulación existente
      const simulationRef = doc(db, SIMULATIONS_COLLECTION, existingSim.data.id);
      await updateDoc(simulationRef, {
        ...simulationData,
        userId,
        updatedAt: new Date().toISOString(),
      });
      
      const updatedDoc = await getDoc(simulationRef);
      return {
        success: true,
        simulation: { id: updatedDoc.id, ...updatedDoc.data() },
        isUpdate: true,
      };
    } else {
      // Crear nueva simulación
      const simulationsRef = collection(db, SIMULATIONS_COLLECTION);
      const newSimulation = {
        ...simulationData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const docRef = await addDoc(simulationsRef, newSimulation);
      
      const newDoc = await getDoc(docRef);
      return {
        success: true,
        simulation: { id: newDoc.id, ...newDoc.data() },
        isUpdate: false,
      };
    }
  } catch (error) {
    console.error('Error al guardar simulación:', error);
    return { success: false, error: 'Error al guardar simulación' };
  }
};

// Eliminar simulación
export const deleteSimulation = async (simulationId) => {
  try {
    const simulationRef = doc(db, SIMULATIONS_COLLECTION, simulationId);
    await deleteDoc(simulationRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar simulación:', error);
    return { success: false, error: 'Error al eliminar simulación' };
  }
};

// Eliminar todas las simulaciones de un usuario
export const clearUserSimulations = async (userId) => {
  try {
    const simulationsRef = collection(db, SIMULATIONS_COLLECTION);
    const q = query(simulationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const batch = [];
    querySnapshot.forEach((doc) => {
      batch.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    console.error('Error al limpiar simulaciones:', error);
    return { success: false, error: 'Error al limpiar simulaciones' };
  }
};

// Verificar si existe simulación para un proyecto
export const hasSimulation = async (userId, projectId) => {
  try {
    const result = await getSimulationByProject(userId, projectId);
    return result.success && result.data !== null;
  } catch (error) {
    console.error('Error al verificar simulación:', error);
    return false;
  }
};

