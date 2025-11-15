const ProjectList = ({
  projects,
  loading,
  isAdmin,
  activeProjectId,
  onSelectProject,
  onOpenPayments,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-600">Cargando pagos...</p>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
        <p className="text-gray-600">No tienes proyectos con pagos registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => {
        const isActive = activeProjectId === project.id;
        return (
          <div
            key={project.id}
            className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 cursor-pointer ${
              isActive ? 'border-blue-500 shadow-xl' : 'border-gray-100 hover:border-gray-200'
            }`}
            onClick={() => onSelectProject(project.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                <p className="text-gray-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {project.location}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'Aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {project.status}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPayments(project.id);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-100"
              >
                {isAdmin ? 'Administrar pagos' : 'Ver gráfico de pagos'}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 4H9m12-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectList;

