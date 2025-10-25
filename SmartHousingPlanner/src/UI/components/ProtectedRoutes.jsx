import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import UserInfoPage from '../../pages/User/MyAccount/UserInfoPage';
import MisPagosPage from '../../pages/User/MisPagos/MisPagosPage';
import FavoritosPage from '../../pages/User/Favoritos/FavoritosPage';
import MisSimulacionesPage from '../../pages/User/Simulaciones/MisSimulacionesPage';

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path="/user-info" element={
        <ProtectedRoute>
          <UserInfoPage />
        </ProtectedRoute>
      } />
      <Route path="/mis-pagos" element={
        <ProtectedRoute>
          <MisPagosPage />
        </ProtectedRoute>
      } />
      <Route path="/favoritos" element={
        <ProtectedRoute>
          <FavoritosPage />
        </ProtectedRoute>
      } />
      <Route path="/mis-simulaciones" element={
        <ProtectedRoute>
          <MisSimulacionesPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default ProtectedRoutes;
