import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSweetAlert } from '../hooks/useSweetAlert';
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  onAuthStateChange,
} from '../services/firebase/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth no puede ser usado fuera de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useSweetAlert();

  const isAuthenticated = useMemo(() => Boolean(user), [user]);
  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  const hasRole = useMemo(() => (role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((userData) => {
      setUser(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        setUser(result.user);
        showNotification('success', '¡Bienvenido!', `Hola ${result.user.name}, has iniciado sesión correctamente`);
        return { success: true, user: result.user };
      } else {
        showNotification('error', 'Error de autenticación', result.error || 'Email o contraseña incorrectos');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification('error', 'Error de autenticación', 'Ocurrió un error al iniciar sesión');
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const register = async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      showNotification('error', 'Error de registro', 'Las contraseñas no coinciden');
      return { success: false, error: 'Las contraseñas no coinciden' };
    }

    if (password.length < 6) {
      showNotification('error', 'Error de registro', 'La contraseña debe tener al menos 6 caracteres');
      return { success: false, error: 'Contraseña muy corta' };
    }

    try {
      const result = await registerUser({ name, email, password });
      if (result.success) {
        setUser(result.user);
        showNotification('success', '¡Registro exitoso!', `Bienvenido ${name}, tu cuenta ha sido creada`);
        return { success: true, user: result.user };
      } else {
        showNotification('error', 'Error de registro', result.error || 'Error al registrar usuario');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification('error', 'Error de registro', 'Ocurrió un error al registrar usuario');
      return { success: false, error: 'Error al registrar usuario' };
    }
  };

  const logout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        setUser(null);
        showNotification('info', 'Sesión cerrada', 'Has cerrado sesión correctamente');
      } else {
        showNotification('error', 'Error', result.error || 'Error al cerrar sesión');
      }
    } catch (error) {
      showNotification('error', 'Error', 'Error al cerrar sesión');
    }
  };

  const updateProfile = async (updatedData) => {
    if (!user?.id) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const result = await updateUserProfile(user.id, updatedData);
      if (result.success) {
        setUser(result.user);
        
        // Si hay advertencia sobre el email, mostrarla como info
        if (result.warning) {
          showNotification('warning', 'Perfil actualizado', result.warning);
        } else {
          showNotification('success', 'Perfil actualizado', 'Tus datos han sido actualizados');
        }
        
        return { success: true, user: result.user, warning: result.warning };
      } else {
        showNotification('error', 'Error', result.error || 'Error al actualizar perfil');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showNotification('error', 'Error', 'Error al actualizar perfil');
      return { success: false, error: 'Error al actualizar perfil' };
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      hasRole,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, isAdmin, hasRole],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
