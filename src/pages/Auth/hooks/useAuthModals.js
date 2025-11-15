import { useReducer, useCallback } from 'react';

// Reducer para manejar estados de modales
const modalReducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_LOGIN':
      return { isLoginModalOpen: true, isRegisterModalOpen: false };
    case 'OPEN_REGISTER':
      return { isLoginModalOpen: false, isRegisterModalOpen: true };
    case 'CLOSE_LOGIN':
      return { ...state, isLoginModalOpen: false };
    case 'CLOSE_REGISTER':
      return { ...state, isRegisterModalOpen: false };
    case 'CLOSE_ALL':
      return { isLoginModalOpen: false, isRegisterModalOpen: false };
    case 'SWITCH_TO_REGISTER':
      return { isLoginModalOpen: false, isRegisterModalOpen: true };
    case 'SWITCH_TO_LOGIN':
      return { isLoginModalOpen: true, isRegisterModalOpen: false };
    default:
      return state;
  }
};

// Hook para manejar los modales de autenticación
export const useAuthModals = () => {
  const [state, dispatch] = useReducer(modalReducer, {
    isLoginModalOpen: false,
    isRegisterModalOpen: false,
  });

  const openLoginModal = useCallback(() => {
    dispatch({ type: 'OPEN_LOGIN' });
  }, []);

  const openRegisterModal = useCallback(() => {
    dispatch({ type: 'OPEN_REGISTER' });
  }, []);

  const closeLoginModal = useCallback(() => {
    dispatch({ type: 'CLOSE_LOGIN' });
  }, []);

  const closeRegisterModal = useCallback(() => {
    dispatch({ type: 'CLOSE_REGISTER' });
  }, []);

  const switchToRegister = useCallback(() => {
    dispatch({ type: 'SWITCH_TO_REGISTER' });
  }, []);

  const switchToLogin = useCallback(() => {
    dispatch({ type: 'SWITCH_TO_LOGIN' });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL' });
  }, []);

  return {
    // Estados
    isLoginModalOpen: state.isLoginModalOpen,
    isRegisterModalOpen: state.isRegisterModalOpen,
    
    // Funciones
    openLoginModal,
    openRegisterModal,
    closeLoginModal,
    closeRegisterModal,
    switchToRegister,
    switchToLogin,
    closeAllModals
  };
};
