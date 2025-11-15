import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PaymentComparisonModal from '../../../UI/components/PaymentComparisonModal';
import { useFirebasePayments } from '../../../hooks/useFirebasePayments';
import { useAuth } from '../../../contexts/AuthContext';
import { getSimulationById, getSimulationByProject } from '../../../services/firebase/simulationsService';

const MisPagosPage = () => {
  const { isAdmin, user } = useAuth();
  const { payments, loading } = useFirebasePayments();
  const userProjects = payments ?? [];

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [comparisonProjectId, setComparisonProjectId] = useState(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [simulationDetails, setSimulationDetails] = useState(null);
  const [isSimulationLoading, setIsSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState(null);
  const defaultProjectId = useMemo(() => {
    if (!userProjects.length) {
      return null;
    }
    return selectedProjectId ?? userProjects[0]?.id ?? null;
  }, [selectedProjectId, userProjects]);

  const activeProject = useMemo(() => {
    if (!userProjects.length) {
      return null;
    }
    return userProjects.find((project) => project.id === defaultProjectId) || userProjects[0];
  }, [defaultProjectId, userProjects]);

  const comparisonProject = useMemo(() => {
    if (!isComparisonOpen) {
      return null;
    }

    if (comparisonProjectId) {
      return userProjects.find((project) => project.id === comparisonProjectId) || activeProject;
    }

    return activeProject;
  }, [activeProject, comparisonProjectId, isComparisonOpen, userProjects]);

  const setActiveProject = useCallback((project) => {
    if (project?.id) {
      setSelectedProjectId(project.id);
    }
  }, []);

  const openComparison = useCallback(
    (project) => {
      setActiveProject(project);
      setComparisonProjectId(project?.id ?? defaultProjectId);
      setIsComparisonOpen(true);
    },
    [defaultProjectId, setActiveProject],
  );

  const handleOpenPayments = useCallback(
    (project) => {
      openComparison(project);
    },
    [openComparison],
  );

  useEffect(() => {
    let active = true;
    const loadSimulationDetails = async () => {
      if (!activeProject) {
        setSimulationDetails(null);
        setSimulationError(null);
        return;
      }

      setIsSimulationLoading(true);
      setSimulationError(null);
      try {
        let result = null;
        if (activeProject.simulationId) {
          result = await getSimulationById(activeProject.simulationId);
        } else if (user?.id && (activeProject.projectId || activeProject.id)) {
          result = await getSimulationByProject(user.id, activeProject.projectId || activeProject.id);
        }

        if (!active) {
          return;
        }

        if (result?.success && result.data) {
          setSimulationDetails(result.data);
        } else {
          setSimulationDetails(null);
          setSimulationError('No se encontró una simulación registrada para este proyecto.');
        }
      } catch (error) {
        if (!active) {
          return;
        }
        setSimulationDetails(null);
        setSimulationError('No se pudo cargar la simulación.');
      } finally {
        if (active) {
          setIsSimulationLoading(false);
        }
      }
    };

    loadSimulationDetails();
    return () => {
      active = false;
    };
  }, [activeProject?.id, activeProject?.projectId, activeProject?.simulationId, user?.id]);

  const simulationSummary = useMemo(() => {
    if (!simulationDetails) {
      return null;
    }
    const calculation = simulationDetails.calculation || {};
    const pickNumber = (...values) => {
      for (const value of values) {
        const parsed = Number(value);
        if (!Number.isNaN(parsed) && value !== undefined && value !== null) {
          return parsed;
        }
      }
      return 0;
    };

    const availableResources =
      pickNumber(simulationDetails.totalAvailable, calculation.totalAvailable, 0) ||
      [
        simulationDetails.cesantiasAmount,
        simulationDetails.primaAmount,
        simulationDetails.savingsAmount,
        calculation.cesantiasAmount,
        calculation.primaAmount,
        calculation.savingsAmount,
      ].reduce((sum, value) => sum + (Number(value) || 0), 0);

    return {
      projectValue: pickNumber(simulationDetails.projectValue, calculation.projectValue),
      financedAmount: pickNumber(
        simulationDetails.creditAmount,
        calculation.creditAmount,
        calculation.loanAmount,
      ),
      downPaymentRequired: pickNumber(
        simulationDetails.requiredDownPayment,
        calculation.requiredDownPayment,
        simulationDetails.downPayment,
      ),
      availableResources,
      subsidy: pickNumber(simulationDetails.subsidyAmount, calculation.subsidyAmount),
      prima: pickNumber(simulationDetails.primaAmount, calculation.primaAmount),
      totalInterests: pickNumber(
        simulationDetails.totalInterests,
        calculation.totalInterest,
        simulationDetails.totalInterest,
      ),
      totalToPay: pickNumber(
        simulationDetails.totalToPay,
        calculation.totalPayments,
        simulationDetails.totalPayments,
      ),
      monthlyPayment: pickNumber(
        calculation.monthlyPayment,
        simulationDetails.monthlyPayment,
        calculation.paymentPerMonth,
      ),
      createdAt: simulationDetails.createdAt || simulationDetails.created_at || null,
    };
  }, [simulationDetails]);

  const activeHistory = activeProject?.paymentHistory ?? [];

  const monthlyRequired = useMemo(() => {
    if (simulationSummary?.monthlyPayment) {
      return Math.round(simulationSummary.monthlyPayment);
    }
    return Math.round(Number(activeProject?.monthlyPayment) || 0);
  }, [simulationSummary, activeProject?.monthlyPayment]);

  const totalPaidActive = useMemo(
    () =>
      activeHistory.reduce(
        (sum, entry) => sum + (Number(entry.actual ?? entry.amount ?? entry.value ?? 0) || 0),
        0,
      ),
    [activeHistory],
  );

  const totalExpectedActive = useMemo(() => {
    if (simulationDetails?.calculation?.totalPayments) {
      return Number(simulationDetails.calculation.totalPayments);
    }
    const totalMonths =
      Number(simulationDetails?.calculation?.totalMonths) ||
      (simulationDetails?.creditTerm ? Number(simulationDetails.creditTerm) * 12 : null) ||
      Number(activeProject?.remainingMonths) ||
      activeHistory.length;
    return (monthlyRequired || 0) * (totalMonths || 0);
  }, [simulationDetails, activeProject?.remainingMonths, activeHistory.length, monthlyRequired]);

  const remainingBalanceActive = Math.max(totalExpectedActive - totalPaidActive, 0);

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
    setComparisonProjectId(null);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mis Pagos</h1>
          <p className="text-lg text-gray-600">
            Gestiona y visualiza el estado de tus pagos hipotecarios
          </p>
        </div>

        {/* Proyectos del Usuario */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Proyectos</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Cargando pagos...</p>
              </div>
            ) : userProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <p className="text-gray-600">No tienes proyectos con pagos registrados aún.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {userProjects.map((project) => {
                  const isActiveSelection = activeProject?.id === project.id;
                  const projectMonthlyPayment =
                    isActiveSelection && monthlyRequired
                      ? monthlyRequired
                      : Number(project.monthlyPayment) || 0;
                  const projectSubsidy =
                    isActiveSelection && simulationSummary
                      ? simulationSummary.subsidy
                      : Number(project.subsidy) || 0;
                  return (
                  <div
                    key={project.id}
                    className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 cursor-pointer ${isActiveSelection
                      ? 'border-blue-500 shadow-xl'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                    onClick={() => setActiveProject(project)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {project.location}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${project.status === 'Aprobado'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPayments(project);
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
                )})}
              </div>
            )}

            {activeProject && (
              <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Detalle de simulación</h3>
                {isSimulationLoading ? (
                  <p className="text-gray-600">Cargando información de la simulación...</p>
                ) : simulationError ? (
                  <p className="text-rose-600">{simulationError}</p>
                ) : simulationSummary ? (
                  <div className="grid gap-4">
                    <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                          Simulación vigente
                        </p>
                        <p className="mt-1 text-3xl font-bold text-blue-600">
                          {formatCurrency(monthlyRequired)}
                        </p>
                        <p className="text-xs text-slate-500">Cuota mensual estimada</p>
                      </div>
                      <div className="grid gap-3 text-sm text-slate-600">
                        <p className="flex items-center justify-between">
                          <span>Valor total</span>
                          <strong className="text-slate-900">
                            {formatCurrency(simulationSummary.projectValue)}
                          </strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Monto a financiar</span>
                          <strong className="text-slate-900">
                            {formatCurrency(simulationSummary.financedAmount)}
                          </strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Cuota inicial requerida (30%)</span>
                          <strong className="text-slate-900">
                            {formatCurrency(simulationSummary.downPaymentRequired)}
                          </strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Recursos disponibles</span>
                          <strong className="text-emerald-600">
                            {formatCurrency(simulationSummary.availableResources)}
                          </strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Subsidio</span>
                          <strong className="text-emerald-600">
                            {formatCurrency(simulationSummary.subsidy)}
                          </strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Prima (junio y diciembre)</span>
                          <strong className="text-emerald-600">
                            {formatCurrency(simulationSummary.prima)}
                          </strong>
                        </p>
                      </div>
                      {simulationSummary.createdAt && (
                        <p className="text-xs text-slate-400">
                          Creada:{' '}
                          {new Date(simulationSummary.createdAt).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Aún no hay una simulación registrada para este proyecto. Solicita a un asesor que la
                    cree para ver los valores exactos.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Resumen Financiero */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen Financiero</h3>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(userProjects.reduce((acc, p) => acc + (p.price || 0), 0))}
                  </div>
                  <div className="text-sm text-gray-500">Valor Total Proyectos</div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total a pagar</span>
                    <span className="font-semibold">
                      {formatCurrency(simulationSummary?.totalToPay || totalExpectedActive)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total pagado</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(totalPaidActive)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo pendiente</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(remainingBalanceActive)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de intereses</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(simulationSummary?.totalInterests || 0)}
                    </span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 mb-1">Próximo Pago</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(monthlyRequired || activeProject?.monthlyPayment || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {activeProject?.name || 'Torres del Sol'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PaymentComparisonModal
          isOpen={isComparisonOpen}
          onClose={closeComparison}
          title={comparisonProject ? `Pagos de ${comparisonProject.name}` : ''}
          subtitle="Compara cada periodo con el valor requerido para mantenerte al día con tu plan hipotecario."
          data={comparisonProject?.paymentHistory ?? []}
          requiredLabel="Pago requerido"
          actualLabel="Pago realizado"
        />
      </div>
    </div>
  );
};

export default MisPagosPage;
