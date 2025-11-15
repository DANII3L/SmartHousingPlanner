import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectSimulator from '../../SimuladorProyecto/ProjectSimulator';
import { getProjectById } from '../../../services/firebase/projectsService';
import PaymentComparisonModal from '../../../UI/components/PaymentComparisonModal.jsx';
import { useFirebaseSimulations } from '../../../hooks/useFirebaseSimulations';
import { useAuth } from '../../../contexts/AuthContext';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { calculateEstimatedPayments } from '../../../utils/paymentCalculations';
import Swal from 'sweetalert2';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSimulationByProject, getSimulationByProjectFromFirebase, simulations, loadSimulations } = useFirebaseSimulations();
  const { showNotification } = useSweetAlert();
  const [showSimulator, setShowSimulator] = useState(false);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);

  // Obtener simulación para este proyecto (primero de la lista local, luego buscar en Firebase)
  useEffect(() => {
    const fetchSimulation = async () => {
      if (!user?.id || !project?.id) {
        setSimulation(null);
        return;
      }

      // Primero intentar buscar en la lista local
      const localSim = getSimulationByProject(project.id);
      if (localSim) {
        setSimulation(localSim);
        return;
      }

      // Si no está en la lista local, buscar directamente en Firebase
      setIsLoadingSimulation(true);
      try {
        const firebaseSim = await getSimulationByProjectFromFirebase(project.id);
        setSimulation(firebaseSim);
      } catch (error) {
        console.error('Error al buscar simulación:', error);
        setSimulation(null);
      } finally {
        setIsLoadingSimulation(false);
      }
    };

    fetchSimulation();
  }, [user?.id, project?.id, simulations, getSimulationByProject, getSimulationByProjectFromFirebase]);

  // Verificar si tiene simulación guardada para este proyecto
  const hasSimulation = useMemo(() => {
    // Si no hay usuario autenticado, no puede tener simulación
    if (!user?.id || !project?.id) return false;
    
    // Verificar si hay simulación encontrada
    return simulation !== null && simulation !== undefined;
  }, [user?.id, project?.id, simulation]);

  // Calcular pagos estimados basados en la simulación (desde fecha de creación hasta fecha de entrega)
  const upcomingPayments = useMemo(() => {
    if (!project || !simulation) return [];
    
    // Usar la función de utilidad para calcular los pagos
    return calculateEstimatedPayments(simulation, project);
  }, [project, simulation]);

  // Manejar click en botón de pagos
  const handleViewPayments = async () => {
    if (!user) {
      showNotification('error', 'Error', 'Debes iniciar sesión para ver los pagos estimados');
      return;
    }

    if (!hasSimulation) {
      const result = await Swal.fire({
        title: 'Simulación requerida',
        text: 'Debes realizar una simulación de financiamiento antes de ver los pagos estimados. ¿Deseas crear una simulación ahora?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, crear simulación',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        setShowSimulator(true);
      }
      return;
    }

    setIsPaymentsModalOpen(true);
  };

  // Cargar proyecto al entrar a la página
  useEffect(() => {
    let isMounted = true;

    const fetchProject = async () => {
      setIsLoading(true);
      const result = await getProjectById(id);
      if (isMounted) {
        if (result.success) {
          setProject(result.data);
        } else {
          setProject(null);
        }
        setIsLoading(false);
      }
    };

    void fetchProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Cargar simulaciones cuando el usuario está autenticado (pero la simulación específica ya se busca en el otro useEffect)
  useEffect(() => {
    if (user?.id && loadSimulations) {
      // Cargar todas las simulaciones del usuario para tenerlas en caché
      loadSimulations();
    }
  }, [user?.id, loadSimulations]);

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
          
          {/* Imagen principal del proyecto */}
          {project.image && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-[500px] object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

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
                    {hasSimulation ? 'Actualizar Simulación' : 'Simular Financiamiento'}
                  </button>
                  <button 
                    onClick={handleViewPayments}
                    disabled={!hasSimulation || !user}
                    className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 ${
                      hasSimulation && user
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                    title={!user ? 'Debes iniciar sesión' : !hasSimulation ? 'Debes crear una simulación primero' : 'Ver gráficos de pagos'}
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Ver Gráficos de Pagos
                    </div>
                  </button>
                  {!hasSimulation && user && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Crea una simulación para ver los pagos estimados
                    </p>
                  )}
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
          onClose={async (simulationSaved = false) => {
            setShowSimulator(false);
            
            // Si se guardó exitosamente, recargar simulaciones para actualizar el estado
            if (simulationSaved) {
              if (loadSimulations) {
                await loadSimulations();
              }
              
              // Mostrar mensaje de confirmación
              showNotification(
                'success', 
                'Simulación guardada', 
                'La simulación se ha guardado correctamente. Ahora puedes ver los gráficos de pagos.'
              );
            }
          }} 
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
