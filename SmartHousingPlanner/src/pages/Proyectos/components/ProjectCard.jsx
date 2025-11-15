import React, { memo, useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirebaseFavorites } from '../../../hooks/useFirebaseFavorites';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { deleteProject as deleteProjectService } from '../../../services/firebase/projectsService';

const ProjectCard = ({ project, cardStyle = 'default', onDetailClick, onRemoveFavorite, onEdit, onDelete }) => {
  const { toggleFavorite, favorites } = useFirebaseFavorites();
  const { showConfirmation, showNotification } = useSweetAlert();
  
  // Derivar isFavorite de la lista de favoritos en lugar de estado separado
  const isFavorite = useMemo(() => {
    if (!project?.id || !favorites) return false;
    return favorites.some(fav => fav.projectId === project.id || fav.id === project.id);
  }, [project?.id, favorites]);

  const handleDelete = useCallback(async () => {
    const confirmed = await showConfirmation(
      '¿Eliminar proyecto?',
      `¿Estás seguro de que quieres eliminar "${project.name}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar'
    );

    if (confirmed) {
      try {
        const result = await deleteProjectService(project.id);
        if (result.success) {
          showNotification('success', 'Proyecto eliminado', 'El proyecto se ha eliminado correctamente');
          onDelete?.(project.id);
        } else {
          showNotification('error', 'Error', result.error || 'Error al eliminar proyecto');
        }
      } catch (error) {
        showNotification('error', 'Error', 'Error al eliminar proyecto');
      }
    }
  }, [project.id, project.name, showConfirmation, showNotification, onDelete]);
  
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

  const statusColor = useMemo(() => getStatusColor(project.status), [project.status]);

  if (cardStyle === 'compact') {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
        <div className="flex">
          <div className="w-32 h-24 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
            {project.image ? (
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full flex items-center justify-center ${project.image ? 'hidden' : ''}`}
            >
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
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
                className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                fill={isFavorite ? 'currentColor' : 'none'} 
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
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
        {project.image ? (
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center ${project.image ? 'hidden' : ''}`}
        >
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
          <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm ${statusColor}`}>
            {project.status}
          </span>
        </div>
        
        <div className="absolute top-4 right-4 flex gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Editar proyecto"
            >
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Eliminar proyecto"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
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
            title="Agregar a favoritos"
          >
            <svg 
              className={`w-5 h-5 transition-colors duration-200 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'}`} 
              fill={isFavorite ? 'currentColor' : 'none'} 
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

export default memo(ProjectCard);
