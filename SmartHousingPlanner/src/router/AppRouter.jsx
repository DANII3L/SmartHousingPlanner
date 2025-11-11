import React, { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import ProtectedRoute from '../UI/components/ProtectedRoute.jsx';

const HomePage = lazy(() => import('../pages/Home/HomePage.jsx'));
const ProjectsPage = lazy(() => import('../pages/Proyectos/components/ProjectsPage.jsx'));
const ProjectDetailPage = lazy(() => import('../pages/Proyectos/components/ProjectDetailPage.jsx'));
const SimuladorPage = lazy(() => import('../pages/SimuladorPagos/SimuladorPage.jsx'));
const UserInfoPage = lazy(() => import('../pages/User/MyAccount/UserInfoPage.jsx'));
const MisPagosPage = lazy(() => import('../pages/User/MisPagos/MisPagosPage.jsx'));
const FavoritosPage = lazy(() => import('../pages/User/Favoritos/FavoritosPage.jsx'));
const MisSimulacionesPage = lazy(() => import('../pages/User/Simulaciones/MisSimulacionesPage.jsx'));

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/proyectos', element: <ProjectsPage /> },
      { path: '/proyectos/:id/simulador', element: <ProjectDetailPage /> },
      { path: '/simulador', element: <SimuladorPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/user-info', element: <UserInfoPage /> },
          { path: '/mis-pagos', element: <MisPagosPage /> },
          { path: '/favoritos', element: <FavoritosPage /> },
          { path: '/mis-simulaciones', element: <MisSimulacionesPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

const AppRouter = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;

