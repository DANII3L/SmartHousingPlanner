import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRouter from './router/AppRouter.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AuthModalProvider } from './pages/Auth/context/AuthModalContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthModalProvider>
        <AppRouter />
      </AuthModalProvider>
    </AuthProvider>
  </StrictMode>,
);
