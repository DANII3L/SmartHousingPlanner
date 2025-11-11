import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiChevronDown, HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthModalContext } from '../../Auth/context/AuthModalContext';
import { useRedirectAfterLogin } from '../../../hooks/useRedirectAfterLogin';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { openLoginModal, openRegisterModal } = useAuthModalContext();
  
  // Manejar redirección después del login
  useRedirectAfterLogin();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <HiHome className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">
              SmartHousing Planner
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors duration-200 relative group ${
                location.pathname === '/' 
                  ? 'text-blue-500 font-semibold' 
                  : 'text-gray-700 hover:text-blue-500 font-medium'
              }`}
            >
              Inicio
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all duration-200 ${
                location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link 
              to="/proyectos" 
              className={`transition-colors duration-200 relative group ${
                location.pathname === '/proyectos' 
                  ? 'text-blue-500 font-semibold' 
                  : 'text-gray-700 hover:text-blue-500 font-medium'
              }`}
            >
              Catálogo
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all duration-200 ${
                location.pathname === '/proyectos' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link 
              to="/simulador" 
              className={`transition-colors duration-200 relative group ${
                location.pathname === '/simulador' 
                  ? 'text-blue-500 font-semibold' 
                  : 'text-gray-700 hover:text-blue-500 font-medium'
              }`}
            >
              Simular
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all duration-200 ${
                location.pathname === '/simulador' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                className={`transition-colors duration-200 relative group ${
                  location.pathname === '/dashboard' 
                    ? 'text-blue-500 font-semibold' 
                    : 'text-gray-700 hover:text-blue-500 font-medium'
                }`}
              >
                Dashboard
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all duration-200 ${
                  location.pathname === '/dashboard' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            )}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={openLoginModal}
                  className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Iniciar sesión
                </button>
                <button 
                  onClick={openRegisterModal}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Comenzar
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-50/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50 hover:bg-gray-100/80 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <Link 
                    to="/dashboard" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/user-info" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link 
                    to="/mis-pagos" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Mis Pagos
                  </Link>
                  <Link 
                    to="/favoritos" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Proyectos Favoritos
                  </Link>
                  <Link 
                    to="/mis-simulaciones" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Mis Simulaciones
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => {
                      logout();
                      setIsProfileDropdownOpen(false);
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
              </div>
            )}
          </div>

          <button 
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`py-2 transition-colors duration-200 ${
                  location.pathname === '/' 
                    ? 'text-blue-500 font-semibold' 
                    : 'text-gray-700 hover:text-blue-500 font-medium'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/proyectos" 
                className={`py-2 transition-colors duration-200 ${
                  location.pathname === '/proyectos' 
                    ? 'text-blue-500 font-semibold' 
                    : 'text-gray-700 hover:text-blue-500 font-medium'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link 
                to="/simulador" 
                className={`py-2 transition-colors duration-200 ${
                  location.pathname === '/simulador' 
                    ? 'text-blue-500 font-semibold' 
                    : 'text-gray-700 hover:text-blue-500 font-medium'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Simular
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/dashboard" 
                  className={`py-2 transition-colors duration-200 ${
                    location.pathname === '/dashboard' 
                      ? 'text-blue-500 font-semibold' 
                      : 'text-gray-700 hover:text-blue-500 font-medium'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <div className="pt-4 border-t border-gray-200/50">
                {!isAuthenticated ? (
                  <>
                    <button 
                      onClick={() => {
                        openLoginModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full mb-3 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                    >
                      Iniciar sesión
                    </button>
                    <button 
                      onClick={() => {
                        openRegisterModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200"
                    >
                      Comenzar
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      ¡Hola, {user?.name}!
                    </p>
                    <button 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

    </header>
  );
};

export default Header;
