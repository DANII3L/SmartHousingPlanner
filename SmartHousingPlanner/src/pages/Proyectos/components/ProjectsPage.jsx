import React from 'react';
import GenericList from '../../../UI/components/GenericList';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from './ProjectCard';

const ProjectsPage = () => {
  const { projects, loading, error } = useProjects();

  const renderProjectCard = (project, index) => (
    <ProjectCard 
      key={project.id} 
      project={project} 
      cardStyle="default"
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
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
        </div>
      </div>

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
