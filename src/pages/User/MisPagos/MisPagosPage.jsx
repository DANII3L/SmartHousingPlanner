import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PaymentComparisonModal from '../../../UI/components/PaymentComparisonModal';
import { useFirebasePayments } from '../../../hooks/useFirebasePayments';
import { useAuth } from '../../../contexts/AuthContext';
import { getSimulationById, getSimulationByProject } from '../../../services/firebase/simulationsService';
import { buildSimulationSummary, calculatePaymentStats } from '../../../utils/simulationMetrics';
import ProjectList from './components/ProjectList';
import SimulationDetailPanel from './components/SimulationDetailPanel';
import FinancialSummaryPanel from './components/FinancialSummaryPanel';

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
    const targetId = comparisonProjectId ?? activeProject?.id;
    if (!targetId) {
      return null;
    }
    return userProjects.find((project) => project.id === targetId) || activeProject || null;
  }, [activeProject, comparisonProjectId, isComparisonOpen, userProjects]);

  const handleSelectProject = useCallback((projectId) => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, []);

  const handleOpenPayments = useCallback((projectId) => {
    if (projectId) {
      setSelectedProjectId(projectId);
      setComparisonProjectId(projectId);
      setIsComparisonOpen(true);
    }
  }, []);

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

  const simulationSummary = useMemo(() => buildSimulationSummary(simulationDetails), [simulationDetails]);

  const activeHistory = useMemo(() => activeProject?.paymentHistory ?? [], [activeProject?.id]);

  const paymentStats = useMemo(
    () =>
      calculatePaymentStats({
        summary: simulationSummary,
        simulationDetails,
        paymentHistory: activeHistory,
        fallbackMonthlyPayment: activeProject?.monthlyPayment,
        fallbackRemainingMonths: activeProject?.remainingMonths,
      }),
    [
      simulationSummary,
      simulationDetails,
      activeHistory,
      activeProject?.monthlyPayment,
      activeProject?.remainingMonths,
    ],
  );

  const { monthlyRequired, totalPaid, totalExpected, remainingBalance } = paymentStats;

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
    setComparisonProjectId(null);
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

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
            <ProjectList
              projects={userProjects}
              loading={loading}
              isAdmin={isAdmin}
              activeProjectId={activeProject?.id}
              onSelectProject={handleSelectProject}
              onOpenPayments={handleOpenPayments}
            />

            {activeProject && (
              <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Detalle de simulación</h3>
                <SimulationDetailPanel
                  isLoading={isSimulationLoading}
                  error={simulationError}
                  summary={simulationSummary}
                  monthlyRequired={monthlyRequired}
                  formatCurrency={formatCurrency}
                />
              </div>
            )}
          </div>

          <FinancialSummaryPanel
            projects={userProjects}
            summary={simulationSummary}
            totalPaid={totalPaid}
            totalExpected={totalExpected}
            remainingBalance={remainingBalance}
            monthlyRequired={monthlyRequired}
            activeProject={activeProject}
            formatCurrency={formatCurrency}
          />
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
