import React, { useState, useEffect, useMemo } from 'react';

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
  
  // Configuración de API
  fetchData,
  
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
  const [items, setItems] = useState(data);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setItems(data);
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [items, searchTerm, searchFields]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

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

  const isInternalLoading = loading !== false ? loading : internalLoading;
  const isInternalError = error !== null ? error : internalError;

  return (
    <div className={containerClassName}>
      {/* Barra de búsqueda */}
      {showSearch && (
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
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
        </div>
      )}

      {/* Loading State */}
      {isInternalLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {isInternalError && (
        <div className="text-center py-20">
          <div className="text-red-500 text-lg font-medium">{isInternalError}</div>
        </div>
      )}

      {/* Items Grid */}
      {!isInternalLoading && !isInternalError && (
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
      {!isInternalLoading && !isInternalError && filteredItems.length === 0 && (
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
