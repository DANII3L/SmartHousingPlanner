import React from 'react';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import { useAuthModalContext } from './context/AuthModalContext';

const AuthManager = () => {
  const {
    isLoginModalOpen,
    isRegisterModalOpen,
    closeLoginModal,
    closeRegisterModal,
    switchToRegister,
    switchToLogin
  } = useAuthModalContext();

  return (
    <>
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={switchToRegister}
      />
      
      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default AuthManager;
