import { useReducer, useEffect, useCallback } from 'react';
import {
  getAllProjects,
  getProjectById,
  getFeaturedProjects,
  searchProjects,
  getProjectsByStatus,
} from '../services/firebase/projectsService';

// Reducer para manejar estado de carga (data, loading, error)
const dataReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Hook para obtener todos los proyectos
export const useProjects = () => {
  const [state, dispatch] = useReducer(dataReducer, {
    data: [],
    loading: true,
    error: null,
  });

  const loadProjects = useCallback(async () => {
    try {
      dispatch({ type: 'LOAD_START' });
      const result = await getAllProjects();
      if (result.success) {
        dispatch({ type: 'LOAD_SUCCESS', payload: result.data });
      } else {
        dispatch({ type: 'LOAD_ERROR', payload: result.error });
      }
    } catch (err) {
      dispatch({ type: 'LOAD_ERROR', payload: 'Error al cargar proyectos' });
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects: state.data, loading: state.loading, error: state.error, refetch: loadProjects };
};

// Hook para obtener un proyecto por ID
export const useProject = (projectId) => {
  const [state, dispatch] = useReducer(dataReducer, {
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!projectId) {
      dispatch({ type: 'LOAD_SUCCESS', payload: null });
      return;
    }

    const loadProject = async () => {
      try {
        dispatch({ type: 'LOAD_START' });
        const result = await getProjectById(projectId);
        if (result.success) {
          dispatch({ type: 'LOAD_SUCCESS', payload: result.data });
        } else {
          dispatch({ type: 'LOAD_ERROR', payload: result.error });
        }
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: 'Error al cargar proyecto' });
      }
    };

    loadProject();
  }, [projectId]);

  return { project: state.data, loading: state.loading, error: state.error };
};

// Hook para obtener proyectos destacados
export const useFeaturedProjects = (count = 3) => {
  const [state, dispatch] = useReducer(dataReducer, {
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        dispatch({ type: 'LOAD_START' });
        const result = await getFeaturedProjects(count);
        if (result.success) {
          dispatch({ type: 'LOAD_SUCCESS', payload: result.data });
        } else {
          dispatch({ type: 'LOAD_ERROR', payload: result.error });
        }
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: 'Error al cargar proyectos destacados' });
      }
    };

    loadProjects();
  }, [count]);

  return { projects: state.data, loading: state.loading, error: state.error };
};

// Hook para buscar proyectos
export const useProjectSearch = (searchTerm) => {
  const [state, dispatch] = useReducer(dataReducer, {
    data: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      dispatch({ type: 'LOAD_SUCCESS', payload: [] });
      return;
    }

    const loadProjects = async () => {
      try {
        dispatch({ type: 'LOAD_START' });
        const result = await searchProjects(searchTerm);
        if (result.success) {
          dispatch({ type: 'LOAD_SUCCESS', payload: result.data });
        } else {
          dispatch({ type: 'LOAD_ERROR', payload: result.error });
        }
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: 'Error al buscar proyectos' });
      }
    };

    // Debounce para evitar demasiadas búsquedas
    const timeoutId = setTimeout(loadProjects, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return { projects: state.data, loading: state.loading, error: state.error };
};

// Hook para obtener proyectos por status
export const useProjectsByStatus = (status) => {
  const [state, dispatch] = useReducer(dataReducer, {
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!status) {
      dispatch({ type: 'LOAD_SUCCESS', payload: [] });
      return;
    }

    const loadProjects = async () => {
      try {
        dispatch({ type: 'LOAD_START' });
        const result = await getProjectsByStatus(status);
        if (result.success) {
          dispatch({ type: 'LOAD_SUCCESS', payload: result.data });
        } else {
          dispatch({ type: 'LOAD_ERROR', payload: result.error });
        }
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: 'Error al cargar proyectos' });
      }
    };

    loadProjects();
  }, [status]);

  return { projects: state.data, loading: state.loading, error: state.error };
};

