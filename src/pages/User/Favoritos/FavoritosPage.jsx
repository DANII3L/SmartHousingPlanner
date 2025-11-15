import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseFavorites } from '../../../hooks/useFirebaseFavorites';
import ProjectCard from '../../Proyectos/components/ProjectCard';
import { useSweetAlert } from '../../../hooks/useSweetAlert';

const FavoritosPage = () => {
  const navigate = useNavigate();
  const { favorites, clearFavorites, removeFromFavorites } = useFirebaseFavorites();
  const { showConfirmation } = useSweetAlert();

  const handleClearFavorites = async () => {
    const confirmed = await showConfirmation(
      '¿Eliminar todos tus favoritos?',
      `Se eliminarán ${favorites.length} ${favorites.length === 1 ? 'proyecto' : 'proyectos'} guardados.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (confirmed) {
      clearFavorites();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </button>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  Mis Favoritos
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Mis Proyectos 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600"> Favoritos</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl leading-relaxed">
                Proyectos que has marcado como favoritos para revisar más tarde.
              </p>
            </div>

            {favorites.length > 0 && (
              <button
                onClick={handleClearFavorites}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar favoritos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No tienes favoritos aún</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explora nuestros proyectos y marca como favoritos aquellos que más te interesen.
            </p>
            <button
              onClick={() => navigate('/proyectos')}
              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explorar Proyectos
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {favorites.length} {favorites.length === 1 ? 'proyecto favorito' : 'proyectos favoritos'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Proyectos que has guardado para revisar más tarde
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((favorite) => {
                // Usar el proyecto completo si está cargado, o crear un objeto básico
                const project = favorite.project || { id: favorite.projectId };
                
                // Si no hay proyecto cargado, no renderizar (o mostrar loading)
                if (!favorite.project) {
                  return null;
                }
                
                return (
                  <ProjectCard 
                    key={favorite.id || favorite.projectId} 
                    project={project} 
                    cardStyle="default"
                    onRemoveFavorite={() => removeFromFavorites(favorite.projectId)}
                  />
                );
              }).filter(Boolean)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritosPage;
