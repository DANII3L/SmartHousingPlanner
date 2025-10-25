import { useLocalStorage } from './useLocalStorage';
import { useSweetAlert } from './useSweetAlert';

// Hook para manejar simulaciones guardadas
export const useSimulations = () => {
  const [simulations, setSimulations, removeSimulation, clearSimulations] = useLocalStorage('smartHousing_simulations', []);
  const { showNotification, showConfirmation } = useSweetAlert();

  // Guardar o actualizar una simulación
  const saveSimulation = (simulationData) => {
    const { projectId, projectName, projectLocation } = simulationData;
    
    // Verificar si ya existe una simulación para este proyecto
    const existingIndex = simulations.findIndex(sim => sim.projectId === projectId);
    
    const simulation = {
      id: existingIndex >= 0 ? simulations[existingIndex].id : Date.now(),
      projectId,
      projectName,
      projectLocation,
      ...simulationData,
      createdAt: existingIndex >= 0 ? simulations[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Actualizar simulación existente
      const updatedSimulations = [...simulations];
      updatedSimulations[existingIndex] = simulation;
      setSimulations(updatedSimulations);
      showNotification('success', 'Simulación actualizada', `La simulación para ${projectName} ha sido actualizada`);
    } else {
      // Crear nueva simulación
      setSimulations(prev => [...prev, simulation]);
      showNotification('success', 'Simulación guardada', `La simulación para ${projectName} ha sido guardada`);
    }

    return { success: true, simulation };
  };

  // Obtener simulación por ID de proyecto
  const getSimulationByProject = (projectId) => {
    return simulations.find(sim => sim.projectId === projectId);
  };

  // Eliminar simulación
  const deleteSimulation = async (simulationId) => {
    const simulation = simulations.find(sim => sim.id === simulationId);
    if (simulation) {
      const confirmed = await showConfirmation(
        '¿Eliminar simulación?',
        `¿Estás seguro de que quieres eliminar la simulación para ${simulation.projectName}?`,
        'Sí, eliminar'
      );

      if (confirmed) {
        removeSimulation({ id: simulationId });
        showNotification('info', 'Simulación eliminada', `La simulación para ${simulation.projectName} ha sido eliminada`);
      }
    }
  };

  // Limpiar todas las simulaciones
  const clearAllSimulations = async () => {
    if (simulations.length > 0) {
      const confirmed = await showConfirmation(
        '¿Eliminar todas las simulaciones?',
        `Se eliminarán ${simulations.length} simulaciones. Esta acción no se puede deshacer.`,
        'Sí, eliminar todas'
      );

      if (confirmed) {
        clearSimulations();
        showNotification('warning', 'Simulaciones eliminadas', 'Se han eliminado todas las simulaciones');
      }
    }
  };

  // Verificar si existe simulación para un proyecto
  const hasSimulation = (projectId) => {
    return simulations.some(sim => sim.projectId === projectId);
  };

  return {
    simulations,
    saveSimulation,
    getSimulationByProject,
    deleteSimulation,
    clearAllSimulations,
    hasSimulation
  };
};