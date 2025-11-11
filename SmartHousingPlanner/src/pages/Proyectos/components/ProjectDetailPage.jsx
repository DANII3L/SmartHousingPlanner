import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectSimulator from '../../SimuladorProyecto/ProjectSimulator';
import { ProjectsService } from '../../../service/projects.js';
import PaymentComparisonModal from '../../../UI/components/PaymentComparisonModal.jsx';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSimulator, setShowSimulator] = useState(false);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);

  const upcomingPayments = useMemo(() => {
    if (!project) return [];

    const baseSource = project.priceFrom ?? project.price ?? 280000000;
    const baseRequired = Math.round((baseSource * 0.3) / 24);
    const baseEstimated = baseRequired - Math.round(baseRequired * 0.04);
    const currentYear = new Date().getFullYear();
    const periods = [
      { label: 'Dic', year: currentYear },
      { label: 'Ene', year: currentYear + 1 },
      { label: 'Feb', year: currentYear + 1 },
      { label: 'Mar', year: currentYear + 1 },
      { label: 'Abr', year: currentYear + 1 },
      { label: 'May', year: currentYear + 1 },
      { label: 'Jun', year: currentYear + 1 },
      { label: 'Jul', year: currentYear + 1 },
      { label: 'Ago', year: currentYear + 1 },
      { label: 'Sep', year: currentYear + 1 },
      { label: 'Oct', year: currentYear + 1 },
      { label: 'Nov', year: currentYear + 1 },
      { label: 'Dic', year: currentYear + 1 },
      { label: 'Ene', year: currentYear + 2 },
      { label: 'Feb', year: currentYear + 2 },
      { label: 'Mar', year: currentYear + 2 },
      { label: 'Abr', year: currentYear + 2 },
      { label: 'May', year: currentYear + 2 },
      { label: 'Jun', year: currentYear + 2 },
      { label: 'Jul', year: currentYear + 2 },
      { label: 'Ago', year: currentYear + 2 },
      { label: 'Sep', year: currentYear + 2 },
    ];

    return periods.map((period, index) => {
      const required = baseRequired + index * 45000;
      const estimated = baseEstimated + index * 38000;
      return {
        label: period.label,
        year: period.year,
        required,
        actual: estimated,
      };
    });
  }, [project]);

  useEffect(() => {
    let isMounted = true;

    const fetchProject = async () => {
      setIsLoading(true);
      const projectData = await ProjectsService.detail(id);
      if (isMounted) {
        setProject(projectData);
        setIsLoading(false);
      }
    };

    void fetchProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!project) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando proyecto...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proyecto no encontrado</h1>
          <button 
            onClick={() => navigate('/proyectos')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/proyectos')}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al catálogo
            </button>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {project.name}
              </h1>
              <div className="flex items-center text-lg text-gray-600 mb-6">
                <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {project.location}
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {project.description}
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-sm text-gray-500 mb-2">Apartamentos</div>
                  <div className="text-2xl font-bold text-gray-900">{project.apartments}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-sm text-gray-500 mb-2">Precio desde</div>
                  <div className="text-2xl font-bold text-blue-600">{formatPrice(project.priceFrom)}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Características</h3>
                <div className="grid grid-cols-2 gap-3">
                  {project.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">¿Listo para simular?</h3>
                <p className="text-gray-600 mb-6">
                  Conoce cómo serían tus pagos mensuales para este proyecto con nuestros gráficos interactivos.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowSimulator(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Simular Financiamiento
                  </button>
                  <button 
                    onClick={() => setIsPaymentsModalOpen(true)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                  >
                    Ver Gráficos de Pagos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Simulator Modal */}
      {showSimulator && (
        <ProjectSimulator 
          project={project} 
          onClose={() => setShowSimulator(false)} 
        />
      )}
      <PaymentComparisonModal
        isOpen={isPaymentsModalOpen}
        onClose={() => setIsPaymentsModalOpen(false)}
        title={project ? `Pagos estimados para ${project.name}` : 'Pagos estimados'}
        subtitle="Revisa la proyección mensual calculada frente al pago objetivo sugerido para mantener el plan financiero al día."
        data={upcomingPayments}
        requiredLabel="Pago objetivo"
        actualLabel="Pago estimado"
      />
    </>
  );
};

export default ProjectDetailPage;
