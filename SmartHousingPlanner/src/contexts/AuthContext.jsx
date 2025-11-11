import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSweetAlert } from '../hooks/useSweetAlert';

const AuthContext = createContext();

const DEMO_USER = {
  id: 1,
  name: 'Daniel',
  email: 'daniel@smarthousing.com',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  createdAt: new Date().toISOString(),
};

const generateToken = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth no puede ser usado fuera de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useLocalStorage('smartHousing_session', null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(session?.token));
  const { showNotification } = useSweetAlert();

  useEffect(() => {
    setIsAuthenticated(Boolean(session?.token));
  }, [session]);

  const login = async (email, password) => {
    const demoPassword = '123456';

    if (email === DEMO_USER.email && password === demoPassword) {
      const token = generateToken();
      const user = sanitizeUser(DEMO_USER);
      setSession({ token, user });
      showNotification('success', '¡Bienvenido!', `Hola ${user.name}, has iniciado sesión correctamente`);
      return { success: true, user };
    }

    showNotification('error', 'Error de autenticación', 'Email o contraseña incorrectos');
    return { success: false, error: 'Credenciales incorrectas' };
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

    const token = generateToken();
    const newUser = {
      id: Date.now(),
      name,
      email,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=150`,
      createdAt: new Date().toISOString(),
    };

    setSession({ token, user: newUser });
    showNotification('success', '¡Registro exitoso!', `Bienvenido ${name}, tu cuenta ha sido creada`);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setSession(null);
    showNotification('info', 'Sesión cerrada', 'Has cerrado sesión correctamente');
  };

  const updateProfile = (updatedData) => {
    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const updatedUser = { ...session.user, ...updatedData };
    setSession({ ...session, user: updatedUser });
    showNotification('success', 'Perfil actualizado', 'Tus datos han sido actualizados');
    return { success: true, user: updatedUser };
  };

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
    }),
    [session, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
