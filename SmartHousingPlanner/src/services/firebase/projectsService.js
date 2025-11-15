import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { getCurrentUser } from './authService';

const PROJECTS_COLLECTION = 'projects';

// Obtener todos los proyectos
export const getAllProjects = async () => {
  try {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return { success: false, error: 'Error al obtener proyectos' };
  }
};

// Obtener proyecto por ID
export const getProjectById = async (projectId) => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      return { success: true, data: { id: projectSnap.id, ...projectSnap.data() } };
    } else {
      return { success: false, error: 'Proyecto no encontrado' };
    }
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    return { success: false, error: 'Error al obtener proyecto' };
  }
};

// Obtener proyectos destacados
export const getFeaturedProjects = async (count = 3) => {
  try {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const q = query(
      projectsRef,
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error al obtener proyectos destacados:', error);
    return { success: false, error: 'Error al obtener proyectos destacados' };
  }
};

// Buscar proyectos
export const searchProjects = async (searchTerm) => {
  try {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const q = query(
      projectsRef,
      orderBy('name'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    
    const projects = [];
    querySnapshot.forEach((doc) => {
      const projectData = doc.data();
      const searchLower = searchTerm.toLowerCase();
      const matchesName = projectData.name?.toLowerCase().includes(searchLower);
      const matchesLocation = projectData.location?.toLowerCase().includes(searchLower);
      const matchesDescription = projectData.description?.toLowerCase().includes(searchLower);
      
      if (matchesName || matchesLocation || matchesDescription) {
        projects.push({ id: doc.id, ...projectData });
      }
    });
    
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error al buscar proyectos:', error);
    return { success: false, error: 'Error al buscar proyectos' };
  }
};

// Filtrar proyectos por status
export const getProjectsByStatus = async (status) => {
  try {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const q = query(
      projectsRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error al obtener proyectos por status:', error);
    return { success: false, error: 'Error al obtener proyectos' };
  }
};

// Crear proyecto (admin)
export const createProject = async (projectData) => {
  try {
    // Verificar que el usuario sea admin
    if (!auth.currentUser) {
      return { success: false, error: 'Debes iniciar sesión para crear proyectos' };
    }

    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'No tienes permisos para crear proyectos. Se requiere rol de administrador' };
    }

    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const newProject = {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(projectsRef, newProject);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    return { success: false, error: 'Error al crear proyecto' };
  }
};

// Actualizar proyecto (admin)
export const updateProject = async (projectId, projectData) => {
  try {
    // Verificar que el usuario sea admin
    if (!auth.currentUser) {
      return { success: false, error: 'Debes iniciar sesión para actualizar proyectos' };
    }

    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'No tienes permisos para actualizar proyectos. Se requiere rol de administrador' };
    }

    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    return { success: false, error: 'Error al actualizar proyecto' };
  }
};

// Eliminar proyecto (admin)
export const deleteProject = async (projectId) => {
  try {
    // Verificar que el usuario sea admin
    if (!auth.currentUser) {
      return { success: false, error: 'Debes iniciar sesión para eliminar proyectos' };
    }

    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'No tienes permisos para eliminar proyectos. Se requiere rol de administrador' };
    }

    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(projectRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    return { success: false, error: 'Error al eliminar proyecto' };
  }
};

