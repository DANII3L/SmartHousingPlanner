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
    return { success: false, error: 'Error al obtener proyectos' };
  }
};

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
    return { success: false, error: 'Error al obtener proyecto' };
  }
};


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
    return { success: false, error: 'Error al obtener proyectos destacados' };
  }
};

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
    return { success: false, error: 'Error al buscar proyectos' };
  }
};

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
    return { success: false, error: 'Error al obtener proyectos' };
  }
};

export const createProject = async (projectData) => {
  try {
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
    return { success: false, error: 'Error al crear proyecto' };
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
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
    return { success: false, error: 'Error al actualizar proyecto' };
  }
};

export const deleteProject = async (projectId) => {
  try {
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
    return { success: false, error: 'Error al eliminar proyecto' };
  }
};

