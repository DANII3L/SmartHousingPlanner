import Swal from 'sweetalert2';

export const useSweetAlert = () => {
  
  const baseConfig = {
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    toast: true
  };

  const showNotification = (icon, title, text = '') => {
    Swal.fire({
      ...baseConfig,
      icon,
      title,
      text
    });
  };

  const showSuccess = (title, text = '') => showNotification('success', title, text);
  const showInfo = (title, text = '') => showNotification('info', title, text);
  const showWarning = (title, text = '') => showNotification('warning', title, text);
  const showError = (title, text = '') => showNotification('error', title, text);

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
    showNotification,
    
    showSuccess,
    showInfo,
    showWarning,
    showError,
    
    showConfirmation
  };
};
