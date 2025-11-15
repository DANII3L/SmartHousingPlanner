import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useRedirectAfterLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && location.state?.from) {
      navigate(location.state.from, { replace: true });
    }
  }, [isAuthenticated, location.state?.from, navigate]);
};
