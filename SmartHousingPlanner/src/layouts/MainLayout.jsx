import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../pages/Home/common/Header.jsx';
import Footer from '../pages/Home/common/Footer.jsx';
import AuthManager from '../pages/Auth/AuthManager.jsx';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthManager />
    </div>
  );
};

export default MainLayout;

