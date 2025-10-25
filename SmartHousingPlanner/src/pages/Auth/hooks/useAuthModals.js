import { useState } from 'react';

// Hook para manejar los modales de autenticación
export const useAuthModals = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Abrir modal de login
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  // Abrir modal de registro
  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  // Cerrar modal de login
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  // Cerrar modal de registro
  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  // Cambiar de login a registro
  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  // Cambiar de registro a login
  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Cerrar todos los modales
  const closeAllModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  return {
    // Estados
    isLoginModalOpen,
    isRegisterModalOpen,
    
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
