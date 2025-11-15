import { useEffect, useCallback, useMemo, useReducer } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  clearUserFavorites,
} from '../services/firebase/favoritesService';
import { getProjectsByIds } from '../services/firebase/projectsService';
import { useSweetAlert } from './useSweetAlert';

const initialState = {
  favoritesRaw: [],
  projectsMap: {},
  loading: true,
};

const favoritesReducer = (state, action) => {
  switch (action.type) {
    case 'RESET':
      return { ...initialState, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_FAVORITES':
      return { ...state, favoritesRaw: action.payload };
    case 'SET_PROJECTS_MAP':
      return { ...state, projectsMap: action.payload };
    case 'REMOVE_FAVORITE': {
      const updatedFavorites = state.favoritesRaw.filter((fav) => fav.projectId !== action.payload);
      const { [action.payload]: _removed, ...restProjects } = state.projectsMap;
      return { ...state, favoritesRaw: updatedFavorites, projectsMap: restProjects };
    }
    case 'CLEAR':
      return { ...state, favoritesRaw: [], projectsMap: {} };
    default:
      return state;
  }
};

export const useFirebaseFavorites = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { showNotification } = useSweetAlert();

  const loadProjectsForFavorites = useCallback(async (favoritesList) => {
    if (!favoritesList || favoritesList.length === 0) {
      dispatch({ type: 'SET_PROJECTS_MAP', payload: {} });
      return;
    }

    try {
      const ids = favoritesList.map((favorite) => favorite.projectId);
      const result = await getProjectsByIds(ids);
      if (!result.success) {
        console.error(result.error);
        return;
      }

      const newProjectsMap = {};
      favoritesList.forEach((favorite) => {
        const projectData = result.data.find((project) => project.id === favorite.projectId);
        if (projectData) {
          newProjectsMap[favorite.projectId] = {
            ...projectData,
            favoriteId: favorite.id,
          };
        }
      });

      dispatch({ type: 'SET_PROJECTS_MAP', payload: newProjectsMap });
    } catch (error) {
      console.error('Error al cargar proyectos de favoritos:', error);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!user?.id) {
      dispatch({ type: 'RESET' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await getUserFavorites(user.id);
      if (result.success) {
        dispatch({ type: 'SET_FAVORITES', payload: result.data });
        await loadProjectsForFavorites(result.data);
      } else {
        dispatch({ type: 'SET_FAVORITES', payload: [] });
        dispatch({ type: 'SET_PROJECTS_MAP', payload: {} });
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user?.id, loadProjectsForFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addToFavorites = useCallback(async (project) => {
    if (!user?.id) {
      showNotification('error', 'Error', 'Debes iniciar sesión para agregar favoritos');
      return;
    }

    const projectId = typeof project === 'string' ? project : project?.id || project;
    const projectName = typeof project === 'object' ? project?.name : 'Proyecto';

    try {
      const result = await addFavorite(user.id, projectId);
      if (result.success) {
        await loadFavorites();
        showNotification('success', '¡Agregado a favoritos!', `${projectName} se agregó a tus favoritos`);
      } else {
        showNotification('error', 'Error', result.error || 'Error al agregar favorito');
      }
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      showNotification('error', 'Error', 'Error al agregar favorito');
    }
  }, [user?.id, loadFavorites, showNotification]);

  const removeFromFavorites = useCallback(async (projectId) => {
    if (!user?.id) {
      return;
    }

    try {
      const projectToRemove = state.projectsMap[projectId];
      const result = await removeFavorite(user.id, projectId);
      if (result.success) {
        dispatch({ type: 'REMOVE_FAVORITE', payload: projectId });
        showNotification('info', 'Eliminado de favoritos', `${projectToRemove?.name || 'Proyecto'} se eliminó de tus favoritos`);
      } else {
        showNotification('error', 'Error', result.error || 'Error al eliminar favorito');
      }
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      showNotification('error', 'Error', 'Error al eliminar favorito');
    }
  }, [user?.id, state.projectsMap, showNotification]);

  const toggleFavorite = useCallback(async (project) => {
    if (!user?.id) {
      showNotification('error', 'Error', 'Debes iniciar sesión para agregar favoritos');
      return;
    }

    const projectId = typeof project === 'string' ? project : project.id;
    const favorite = await isFavorite(user.id, projectId);
    if (favorite) {
      await removeFromFavorites(projectId);
    } else {
      await addToFavorites(project);
    }
  }, [user?.id, removeFromFavorites, addToFavorites, showNotification]);

  const checkIsFavoriteSync = useCallback((projectId) => {
    if (!projectId || !state.favoritesRaw.length) return false;
    return state.favoritesRaw.some((fav) => fav.projectId === projectId);
  }, [state.favoritesRaw]);

  const clearFavorites = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      const result = await clearUserFavorites(user.id);
      if (result.success) {
        dispatch({ type: 'CLEAR' });
        showNotification('info', 'Favoritos eliminados', 'Se han eliminado todos tus favoritos');
      } else {
        showNotification('error', 'Error', result.error || 'Error al limpiar favoritos');
      }
    } catch (error) {
      console.error('Error al limpiar favoritos:', error);
      showNotification('error', 'Error', 'Error al limpiar favoritos');
    }
  }, [user?.id, showNotification]);

  const favorites = useMemo(() => {
    return state.favoritesRaw.map((favorite) => ({
      id: favorite.id,
      favoriteId: favorite.id,
      projectId: favorite.projectId,
      userId: favorite.userId,
      createdAt: favorite.createdAt,
      project: state.projectsMap[favorite.projectId] || null,
    }));
  }, [state.favoritesRaw, state.projectsMap]);

  return {
    favorites,
    favoritesIds: state.favoritesRaw,
    projectsMap: state.projectsMap,
    loading: state.loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite: checkIsFavoriteSync,
    clearFavorites,
    loadFavorites,
  };
};

