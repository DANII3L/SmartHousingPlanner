import React, { useMemo, useState } from 'react';

const GenericList = ({ 
  // Configuración básica
  data = [],
  itemsPerPage = 6,
  cardStyle = 'default',
  
  // Funciones personalizadas
  onDetailClick,
  onSearch,
  onPageChange,
  
  // Configuración de renderizado
  renderItem,
  searchFields = ['name', 'title'],
  searchPlaceholder = "Buscar...",
  
  // Configuración de UI
  showSearch = true,
  showPagination = true,
  emptyMessage = "No se encontraron resultados",
  emptySubMessage = "Intenta con otros términos de búsqueda",
  
  // Estilos personalizados
  containerClassName = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
  gridClassName,
  
  // Loading y error
  loading = false,
  error = null
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const normalizedItems = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return normalizedItems;
    
    return normalizedItems.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [normalizedItems, searchTerm, searchFields]);

  // Filtro por categoría (status)
  const filteredAndCategorizedItems = useMemo(() => {
    if (selectedFilter === "Todos") {
      return filteredItems;
    }

    if (selectedFilter === "Menor a mayor") {
      return [...filteredItems].sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
    }

    if (selectedFilter === "Mayor a menor") {
      return [...filteredItems].sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
    }

    return filteredItems.filter(item => item.status === selectedFilter);
  }, [filteredItems, selectedFilter]);

  const totalPages = Math.ceil(filteredAndCategorizedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredAndCategorizedItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (onSearch) {
      onSearch(value);
    }
  };

  const renderItemContent = (item, index) => {
    if (renderItem) {
      return renderItem(item, index);
    }
    
    return (
      <div key={item.id || index} className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold">{item.name || item.title || 'Item'}</h3>
        {item.description && <p className="text-gray-600 mt-2">{item.description}</p>}
      </div>
    );
  };

  const getGridClassName = () => {
    if (gridClassName) return gridClassName;
    
    switch (cardStyle) {
      case 'compact':
        return 'grid grid-cols-1 gap-4';
      case 'list':
        return 'flex flex-col gap-4';
      case 'small':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
      default:
        return 'grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8';
    }
  };

  const isLoading = typeof loading === 'boolean' ? loading : false;
  const errorMessage = error ?? null;

  return (
    <div className={containerClassName}>
      {/* Barra de búsqueda */}
      {showSearch && (
        <div className="mb-8">
         <div className="flex items-center justify-center max-w-md mx-auto space-x-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
             </div>
              
            {/* Dropdown de Filtro */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition duration-200 flex items-center gap-2"
              >
                <span>{selectedFilter}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  {["Todos", "Preventa", "En construcción", "Entregado", "Menor a mayor", "Mayor a menor"].map((option) => (
                    <button
                          key={option}
                          onClick={() => {
                            setSelectedFilter(option);
                            setIsFilterOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100 ${
                            selectedFilter === option ? "font-semibold text-blue-600" : ""
                          }`}
                        >
                        {option}
                    </button>
                   ))}
               </div>
             )}
           </div>
         </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div className="text-center py-20">
          <div className="text-red-500 text-lg font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && !errorMessage && (
        <>
          <div className={getGridClassName()}>
            {paginatedItems.map((item, index) => renderItemContent(item, startIndex + index))}
          </div>

          {/* Paginación */}
          {showPagination && totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Anterior
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && !errorMessage && filteredAndCategorizedItems.length === 0 && (
        <div className="text-center py-20">
          <div className="text-gray-500 text-lg font-medium">{emptyMessage}</div>
          {emptySubMessage && (
            <p className="text-gray-400 mt-2">{emptySubMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GenericList;
