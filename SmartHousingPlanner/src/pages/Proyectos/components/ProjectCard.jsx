import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

const ProjectCard = ({ project, cardStyle = 'default', onDetailClick, onRemoveFavorite }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Preventa': return 'bg-blue-100 text-blue-800';
      case 'En construcción': return 'bg-yellow-100 text-yellow-800';
      case 'Entregado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (cardStyle === 'compact') {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
        <div className="flex">
          <div className="w-32 h-24 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 relative">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onRemoveFavorite) {
                  onRemoveFavorite();
                } else {
                  toggleFavorite(project);
                }
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
            >
              <svg 
                className={`w-4 h-4 ${isFavorite(project.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                fill={isFavorite(project.id) ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">{project.location}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{project.apartments} apartamentos</span>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{formatPrice(project.priceFrom)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 pt-0">
          {onDetailClick ? (
            <button 
              onClick={() => onDetailClick(project)}
              className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Ver detalles
            </button>
          ) : (
            <Link 
              to={`/proyectos/${project.id}/simulador`}
              className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Ver detalles
            </Link>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100/50 hover:border-blue-200 hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">Vista previa del proyecto</p>
          </div>
        </div>
        
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onRemoveFavorite) {
                onRemoveFavorite();
              } else {
                toggleFavorite(project);
              }
            }}
            className="p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg 
              className={`w-5 h-5 transition-colors duration-200 ${isFavorite(project.id) ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'}`} 
              fill={isFavorite(project.id) ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-6 lg:p-8">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">
          {project.name}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{project.location}</span>
        </div>

        <div className="flex items-center justify-between mb-6 py-4 border-t border-b border-gray-100">
          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium">{project.apartments} apartamentos</span>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Entrega: {new Date(project.deliveryDate).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-6">
          {formatPrice(project.priceFrom)}
        </div>

        {onDetailClick ? (
          <button 
            onClick={() => onDetailClick(project)}
            className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
          >
            <span className="flex items-center justify-center">
              Ver detalles
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        ) : (
          <Link 
            to={`/proyectos/${project.id}/simulador`}
            className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
          >
            <span className="flex items-center justify-center">
              Ver detalles
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
