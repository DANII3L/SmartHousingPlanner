import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Hook para manejar redirección después del login
export const useRedirectAfterLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && location.state?.from) {
      // Si el usuario se autenticó y hay una ruta guardada, redirigir
      navigate(location.state.from, { replace: true });
    }
  }, [isAuthenticated, location.state?.from, navigate]);
};
