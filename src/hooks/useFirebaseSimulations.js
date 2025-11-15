import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserSimulations,
  getSimulationByProject as getSimulationByProjectService,
  saveSimulation,
  deleteSimulation,
  clearUserSimulations,
  hasSimulation,
} from '../services/firebase/simulationsService';
import { useSweetAlert } from './useSweetAlert';

// Hook para manejar simulaciones con Firebase
export const useFirebaseSimulations = () => {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification, showConfirmation } = useSweetAlert();

  // Función para cargar simulaciones (memoizada)
  const loadSimulations = useCallback(async () => {
    if (!user?.id) {
      setSimulations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getUserSimulations(user.id);
      if (result.success) {
        setSimulations(result.data || []);
      } else {
        setSimulations([]);
      }
    } catch (error) {
      console.error('Error al cargar simulaciones:', error);
      setSimulations([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar simulaciones al montar o cambiar usuario
  useEffect(() => {
    loadSimulations();
  }, [loadSimulations]);

  // Guardar o actualizar simulación
  const saveSim = useCallback(async (simulationData) => {
    if (!user?.id) {
      showNotification('error', 'Error', 'Debes iniciar sesión para guardar simulaciones');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const result = await saveSimulation(user.id, simulationData);
      if (result.success) {
        await loadSimulations(); // Usar función memoizada

        const message = result.isUpdate
          ? `La simulación para ${simulationData.projectName} ha sido actualizada`
          : `La simulación para ${simulationData.projectName} ha sido guardada`;

        showNotification('success', result.isUpdate ? 'Simulación actualizada' : 'Simulación guardada', message);
        return { success: true, simulation: result.simulation };
      } else {
        showNotification('error', 'Error', result.error || 'Error al guardar simulación');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification('error', 'Error', 'Error al guardar simulación');
      return { success: false, error: 'Error al guardar simulación' };
    }
  }, [user?.id, loadSimulations, showNotification]);

  // Obtener simulación por proyecto (versión sincrónica usando lista cargada)
  const getSimByProject = useCallback((projectId) => {
    if (!projectId || !simulations.length) return null;
    return simulations.find(sim => sim.projectId === projectId) || null;
  }, [simulations]);

  // Obtener simulación por proyecto directamente desde Firebase (con userId y projectId)
  const getSimulationByProjectFromFirebase = useCallback(async (projectId) => {
    if (!user?.id || !projectId) {
      return null;
    }

    try {
      const result = await getSimulationByProjectService(user.id, projectId);
      if (result.success && result.data) {
        // Actualizar la lista local si se encuentra en Firebase
        setSimulations((prev) => {
          const existingIndex = prev.findIndex(sim => sim.id === result.data.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = result.data;
            return updated;
          } else {
            return [...prev, result.data];
          }
        });
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener simulación desde Firebase:', error);
      return null;
    }
  }, [user?.id]);

  // Eliminar simulación
  const deleteSim = useCallback(async (simulationId) => {
    if (!user?.id) {
      return;
    }

    const simulation = simulations.find((sim) => sim.id === simulationId);
    if (!simulation) {
      return;
    }

    const confirmed = await showConfirmation(
      '¿Eliminar simulación?',
      `¿Estás seguro de que quieres eliminar la simulación para ${simulation.projectName}?`,
      'Sí, eliminar'
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteSimulation(simulationId);
      if (result.success) {
        await loadSimulations(); // Usar función memoizada
        showNotification('info', 'Simulación eliminada', `La simulación para ${simulation.projectName} ha sido eliminada`);
      } else {
        showNotification('error', 'Error', result.error || 'Error al eliminar simulación');
      }
    } catch (error) {
      showNotification('error', 'Error', 'Error al eliminar simulación');
    }
  }, [user?.id, simulations, loadSimulations, showNotification, showConfirmation]);

  // Limpiar todas las simulaciones
  const clearAllSimulations = useCallback(async () => {
    if (!user?.id || simulations.length === 0) {
      return;
    }

    const confirmed = await showConfirmation(
      '¿Eliminar todas las simulaciones?',
      `Se eliminarán ${simulations.length} simulaciones. Esta acción no se puede deshacer.`,
      'Sí, eliminar todas'
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await clearUserSimulations(user.id);
      if (result.success) {
        setSimulations([]);
        showNotification('warning', 'Simulaciones eliminadas', 'Se han eliminado todas las simulaciones');
      } else {
        showNotification('error', 'Error', result.error || 'Error al eliminar simulaciones');
      }
    } catch (error) {
      showNotification('error', 'Error', 'Error al eliminar simulaciones');
    }
  }, [user?.id, simulations, showConfirmation, showNotification]);

  return {
    simulations,
    loading,
    saveSimulation: saveSim,
    getSimulationByProject: getSimByProject, // Versión sincrónica usando lista local
    getSimulationByProjectFromFirebase, // Versión asíncrona que busca directamente en Firebase
    deleteSimulation: deleteSim,
    clearAllSimulations,
    loadSimulations, // Exponer para recargar manualmente si es necesario
    // hasSimulation se deriva ahora directamente de simulations en los componentes
  };
};

