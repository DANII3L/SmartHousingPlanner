import React, { useReducer, useCallback } from 'react';
import GenericList from '../../../UI/components/GenericList';
import { useProjects } from '../../../hooks/useFirebaseProjects';
import ProjectCard from './ProjectCard';
import ProjectFormModal from './ProjectFormModal';
import { useAuth } from '../../../contexts/AuthContext';

// Reducer para manejar el estado del formulario
const formModalReducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_CREATE':
      return { isOpen: true, project: null };
    case 'OPEN_EDIT':
      return { isOpen: true, project: action.payload };
    case 'CLOSE':
      return { isOpen: false, project: null };
    default:
      return state;
  }
};

const ProjectsPage = () => {
  const { projects, loading, error, refetch } = useProjects();
  const { isAuthenticated, isAdmin } = useAuth();
  const [formModal, dispatchFormModal] = useReducer(formModalReducer, {
    isOpen: false,
    project: null,
  });

  const handleCreate = useCallback(() => {
    dispatchFormModal({ type: 'OPEN_CREATE' });
  }, []);

  const handleEdit = useCallback((project) => {
    dispatchFormModal({ type: 'OPEN_EDIT', payload: project });
  }, []);

  const handleFormSuccess = useCallback(() => {
    refetch?.();
    dispatchFormModal({ type: 'CLOSE' });
  }, [refetch]);

  const handleFormClose = useCallback(() => {
    dispatchFormModal({ type: 'CLOSE' });
  }, []);

  // Memoizar la función de renderizado para evitar recrearla en cada render
  const renderProjectCard = React.useCallback((project, index) => (
    <ProjectCard 
      key={project.id} 
      project={project} 
      cardStyle="default"
      onEdit={isAdmin ? () => handleEdit(project) : null}
      onDelete={isAdmin ? refetch : null}
    />
  ), [isAdmin, handleEdit, refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-center flex-1 min-w-[300px]">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Catálogo completo
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Todos nuestros 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700"> Proyectos</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explora nuestra completa selección de proyectos habitacionales. 
                Encuentra el lugar perfecto para tu nuevo hogar.
              </p>
            </div>

            {isAdmin && (
              <div className="flex-shrink-0">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Proyecto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProjectFormModal
        key={formModal.project?.id || 'new'} // Key para resetear el formulario
        isOpen={formModal.isOpen}
        onClose={handleFormClose}
        project={formModal.project}
        onSuccess={handleFormSuccess}
      />

      <GenericList
        data={projects}
        itemsPerPage={9}
        cardStyle="default"
        renderItem={renderProjectCard}
        searchFields={['name', 'location']}
        searchPlaceholder="Buscar proyectos..."
        loading={loading}
        error={error}
        emptyMessage="No se encontraron proyectos"
        emptySubMessage="Intenta con otros términos de búsqueda"
      />
    </div>
  );
};

export default ProjectsPage;
