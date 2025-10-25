import Swal from 'sweetalert2';

// Hook global para manejar notificaciones SweetAlert de forma automática
export const useSweetAlert = () => {
  
  // Configuración base para todas las notificaciones
  const baseConfig = {
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    toast: true
  };

  // Función base para mostrar notificaciones
  const showNotification = (icon, title, text = '') => {
    Swal.fire({
      ...baseConfig,
      icon,
      title,
      text
    });
  };

  // Métodos básicos para casos especiales
  const showSuccess = (title, text = '') => showNotification('success', title, text);
  const showInfo = (title, text = '') => showNotification('info', title, text);
  const showWarning = (title, text = '') => showNotification('warning', title, text);
  const showError = (title, text = '') => showNotification('error', title, text);

  // Función para confirmaciones
  const showConfirmation = async (title, text, confirmButtonText = 'Sí, confirmar', cancelButtonText = 'Cancelar') => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true
    });
    return result.isConfirmed;
  };

  return {
    // Sistema principal - directo
    showNotification,
    
    // Métodos básicos
    showSuccess,
    showInfo,
    showWarning,
    showError,
    
    // Confirmaciones
    showConfirmation
  };
};
