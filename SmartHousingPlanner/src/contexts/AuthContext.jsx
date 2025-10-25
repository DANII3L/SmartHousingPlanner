import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSweetAlert } from '../hooks/useSweetAlert';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser, removeUser] = useLocalStorage('smartHousing_user', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showNotification } = useSweetAlert();

  // Verificar autenticación al cargar
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Función de login
  const login = (email, password) => {
    // Usuario por defecto para demo
    const defaultUser = {
      id: 1,
      name: 'Daniel',
      email: 'daniel@smarthousing.com',
      password: '123456',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    // Verificar credenciales
    if (email === defaultUser.email && password === defaultUser.password) {
      console.log('AuthContext - Login successful, setting user:', defaultUser);
      setUser(defaultUser);
      setIsAuthenticated(true);
      console.log('AuthContext - User set, isAuthenticated should be true');
      showNotification('success', '¡Bienvenido!', `Hola ${defaultUser.name}, has iniciado sesión correctamente`);
      return { success: true, user: defaultUser };
    } else {
      console.log('AuthContext - Login failed, invalid credentials');
      showNotification('error', 'Error de autenticación', 'Email o contraseña incorrectos');
      return { success: false, error: 'Credenciales incorrectas' };
    }
  };

  // Función de registro
  const register = (userData) => {
    const { name, email, password, confirmPassword } = userData;

    // Validaciones básicas
    if (password !== confirmPassword) {
      showNotification('error', 'Error de registro', 'Las contraseñas no coinciden');
      return { success: false, error: 'Las contraseñas no coinciden' };
    }

    if (password.length < 6) {
      showNotification('error', 'Error de registro', 'La contraseña debe tener al menos 6 caracteres');
      return { success: false, error: 'Contraseña muy corta' };
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now(), // ID único basado en timestamp
      name,
      email,
      password, // En producción esto debería estar hasheado
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=150`,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    setIsAuthenticated(true);
    showNotification('success', '¡Registro exitoso!', `Bienvenido ${name}, tu cuenta ha sido creada`);
    return { success: true, user: newUser };
  };

  // Función de logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    showNotification('info', 'Sesión cerrada', 'Has cerrado sesión correctamente');
  };

  // Función para actualizar perfil
  const updateProfile = (updatedData) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      showNotification('success', 'Perfil actualizado', 'Tus datos han sido actualizados');
      return { success: true, user: updatedUser };
    }
    return { success: false, error: 'Usuario no autenticado' };
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
