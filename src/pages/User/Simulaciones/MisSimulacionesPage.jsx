import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseSimulations } from '../../../hooks/useFirebaseSimulations';
import PaymentComparisonModal from '../../../UI/components/PaymentComparisonModal';
import { getProjectById } from '../../../services/firebase/projectsService';
import { calculateEstimatedPayments } from '../../../utils/paymentCalculations';

const MisSimulacionesPage = () => {
  const navigate = useNavigate();
  const { simulations, loading, deleteSimulation, clearAllSimulations, loadSimulations } = useFirebaseSimulations();
  const [openPaymentModalId, setOpenPaymentModalId] = useState(null);
  const [projectsMap, setProjectsMap] = useState({}); // Cache de proyectos por ID

  useEffect(() => {
    if (loadSimulations) {
      loadSimulations();
    }
  }, [loadSimulations]);

  useEffect(() => {
    const loadProjects = async () => {
      const projectsToLoad = simulations
        .filter(sim => sim.projectId && !projectsMap[sim.projectId])
        .map(sim => sim.projectId);

      if (projectsToLoad.length === 0) return;

      const newProjectsMap = { ...projectsMap };
      
      await Promise.all(
        projectsToLoad.map(async (projectId) => {
          try {
            const result = await getProjectById(projectId);
            if (result.success && result.data) {
              newProjectsMap[projectId] = result.data;
            }
          } catch (error) {
            console.error(`Error al cargar proyecto ${projectId}:`, error);
          }
        })
      );

      setProjectsMap(newProjectsMap);
    };

    if (simulations.length > 0) {
      loadProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulations]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteSimulation = (simulationId) => {
    deleteSimulation(simulationId);
  };

  const handleClearAllSimulations = () => {
    clearAllSimulations();
  };

  // Calcular pagos estimados para una simulación (usando función de utilidad)
  const calculatePayments = (simulation) => {
    if (!simulation) return [];
    
    // Obtener proyecto si está disponible
    const project = projectsMap[simulation.projectId];
    
    // Usar la función de utilidad para calcular los pagos
    return calculateEstimatedPayments(simulation, project);
  };

  // Obtener los pagos para el modal abierto
  const currentPayments = useMemo(() => {
    if (!openPaymentModalId) return [];
    const simulation = simulations.find(sim => sim.id === openPaymentModalId);
    if (!simulation) return [];
    return calculatePayments(simulation);
  }, [openPaymentModalId, simulations, projectsMap]);

  // Obtener el proyecto del modal abierto
  const currentProject = useMemo(() => {
    if (!openPaymentModalId) return null;
    const simulation = simulations.find(sim => sim.id === openPaymentModalId);
    if (!simulation?.projectId) return null;
    return projectsMap[simulation.projectId] || null;
  }, [openPaymentModalId, simulations, projectsMap]);

  const handleViewPayments = (simulationId) => {
    setOpenPaymentModalId(simulationId);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModalId(null);
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
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
                  Mis Simulaciones
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Mis
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600"> Simulaciones</span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl leading-relaxed">
                Revisa y gestiona todas tus simulaciones de financiamiento guardadas.
              </p>
            </div>

            {simulations.length > 0 && (
              <button
                onClick={handleClearAllSimulations}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar todas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Cargando simulaciones...</p>
            </div>
          </div>
        ) : simulations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No tienes simulaciones guardadas</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Crea simulaciones de financiamiento para tus proyectos favoritos y guárdalas aquí.
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
                    {simulations.length} {simulations.length === 1 ? 'simulación guardada' : 'simulaciones guardadas'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Tus simulaciones de financiamiento organizadas por proyecto
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {simulations.map((simulation) => (
                <div key={simulation.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{simulation.projectName}</h3>
                        <p className="text-gray-600 text-sm">{simulation.projectLocation}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSimulation(simulation.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Resumen Principal */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 mb-4">
                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {simulation.calculation ? formatCurrency(simulation.calculation.monthlyPayment) : formatCurrency(simulation.monthlyPayment || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Cuota mensual estimada</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Valor total</div>
                          <div className="font-semibold">{formatCurrency(simulation.projectValue)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Monto a financiar</div>
                          <div className="font-semibold">{formatCurrency(simulation.calculation?.creditAmount || simulation.creditAmount || 0)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Detalles financieros */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Cuota inicial requerida (30%)</span>
                        <span className="font-medium">{formatCurrency(simulation.calculation?.requiredDownPayment || simulation.requiredDownPayment || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Recursos disponibles</span>
                        <span className="font-medium text-green-600">{formatCurrency(simulation.calculation?.totalAvailable || simulation.totalAvailable || 0)}</span>
                      </div>
                      {simulation.calculation?.subsidyAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Subsidio</span>
                          <span className="font-medium text-blue-600">{formatCurrency(simulation.calculation.subsidyAmount)}</span>
                        </div>
                      )}
                      {simulation.calculation?.cesantiasAmount > 0 && simulation.calculation?.hasCesantias && (
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-600">Cesantías (cada marzo)</span>
                          <span className="font-medium text-orange-600">{formatCurrency(simulation.calculation.totalCesantiasAmount)}</span>
                        </div>
                      )}
                      {simulation.calculation?.primaAmount > 0 && simulation.calculation?.hasPrima && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Prima (junio y diciembre)</span>
                          <span className="font-medium text-green-600">{formatCurrency(simulation.calculation.totalPrimaAmount)}</span>
                        </div>
                      )}
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-sm">
                        <span>Total de intereses</span>
                        <span className="font-medium">{formatCurrency(simulation.calculation?.totalInterest || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total a pagar</span>
                        <span>{formatCurrency(simulation.calculation?.totalPayments || 0)}</span>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Creada: {formatDate(simulation.createdAt)}</span>
                        {simulation.updatedAt !== simulation.createdAt && (
                          <span>Actualizada: {formatDate(simulation.updatedAt)}</span>
                        )}
                      </div>
                    </div>

                    {/* Botón Ver Gráficos */}
                    <button
                      onClick={() => handleViewPayments(simulation.id)}
                      disabled={!simulation.calculation}
                      className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200 ${
                        simulation.calculation
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                      }`}
                      title={!simulation.calculation ? 'No hay cálculo disponible' : 'Ver gráficos de pagos'}
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Ver Gráficos de Pagos
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Gráficos de Pagos */}
      {openPaymentModalId && (
        <PaymentComparisonModal
          isOpen={true}
          onClose={handleClosePaymentModal}
          title={currentProject ? `Pagos estimados para ${currentProject.name}` : `Pagos estimados para ${simulations.find(sim => sim.id === openPaymentModalId)?.projectName || 'Proyecto'}`}
          subtitle="Revisa la proyección mensual calculada frente al pago objetivo sugerido para mantener el plan financiero al día."
          data={currentPayments}
          requiredLabel="Pago objetivo"
          actualLabel="Pago estimado"
        />
      )}
    </div>
  );
};

export default MisSimulacionesPage;
