import { useLocalStorage } from '../../../hooks/useLocalStorage';

// Hook para historial de búsquedas
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory, removeSearchItem, clearSearchHistory] = useLocalStorage('smartHousing_searchHistory', []);

  const addSearch = (searchTerm) => {
    if (searchTerm && searchTerm.trim()) {
      const trimmedTerm = searchTerm.trim();
      const filteredHistory = searchHistory.filter(item => item !== trimmedTerm);
      const newHistory = [trimmedTerm, ...filteredHistory].slice(0, 10);
      setSearchHistory(newHistory);
    }
  };

  return {
    searchHistory,
    addSearch,
    removeSearchItem,
    clearSearchHistory
  };
};
