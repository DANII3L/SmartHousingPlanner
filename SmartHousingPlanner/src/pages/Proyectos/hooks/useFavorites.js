import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useSweetAlert } from '../../../hooks/useSweetAlert';

// Hook para manejar favoritos
export const useFavorites = () => {
  const [favorites, setFavorites, removeFavorite, clearFavorites] = useLocalStorage('smartHousing_favorites', []);
  const { showNotification } = useSweetAlert();

  const addToFavorites = (project) => {
    if (!isFavorite(project.id)) {
      setFavorites(prev => [...prev, project]);
      showNotification('success', '¡Agregado a favoritos!', `${project.name || 'Proyecto'} se agregó a tus favoritos`);
    }
  };

  const removeFromFavorites = (projectId) => {
    const projectToRemove = favorites.find(project => project.id === projectId);
    if (projectToRemove) {
      removeFavorite(projectToRemove);
      showNotification('info', 'Eliminado de favoritos', `${projectToRemove.name || 'Proyecto'} se eliminó de tus favoritos`);
    }
  };

  const toggleFavorite = (project) => {
    if (isFavorite(project.id)) {
      removeFromFavorites(project.id);
    } else {
      addToFavorites(project);
    }
  };

  const isFavorite = (projectId) => {
    return favorites.some(project => project.id === projectId);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
};
