import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

// Función para formatear números con separadores de miles
const formatNumber = (value) => {
  if (!value && value !== 0) return '';
  const cleanValue = value.toString().replace(/[^\d]/g, '');
  if (!cleanValue) return '';
  const number = parseFloat(cleanValue);
  return isNaN(number) ? '' : number.toLocaleString('es-CO');
};

// Función para parsear números formateados
const parseFormattedNumber = (value) => {
  if (!value) return 0;
  const cleanValue = value.replace(/[^\d]/g, '');
  return cleanValue ? parseFloat(cleanValue) : 0;
};

const UserInfoPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento: '',
    tipoDocumento: 'CC',
    fechaNacimiento: '',
    genero: 'Masculino',
    estadoCivil: 'Soltero',
    ocupacion: '',
    ingresos: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [formattedIncome, setFormattedIncome] = useState('');

  // Cargar datos del usuario cuando el componente se monte
  useEffect(() => {
    if (user) {
      // Dividir el nombre completo en nombre y apellido
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const nombre = nameParts[0] || '';
      const apellido = nameParts.slice(1).join(' ') || '';

      const monthlyIncome = user.monthlyIncome || '';
      
      setFormData({
        nombre,
        apellido,
        email: user.email || '',
        telefono: user.phone || '',
        documento: user.document || '',
        tipoDocumento: user.documentType || 'CC',
        fechaNacimiento: user.birthDate || '',
        genero: user.gender || 'Masculino',
        estadoCivil: user.maritalStatus || 'Soltero',
        ocupacion: user.occupation || '',
        ingresos: monthlyIncome,
        direccion: user.address || '',
        ciudad: user.city || '',
        departamento: user.department || '',
        codigoPostal: user.postalCode || ''
      });
      
      // Formatear ingresos iniciales
      if (monthlyIncome) {
        setFormattedIncome(formatNumber(monthlyIncome));
      } else {
        setFormattedIncome('');
      }
      
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Si es el campo de ingresos, aplicar formato de moneda
    if (name === 'ingresos') {
      const numericValue = parseFormattedNumber(value);
      const formatted = formatNumber(numericValue.toString());
      setFormattedIncome(formatted);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue.toString(),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.documento.trim()) newErrors.documento = 'El documento es requerido';
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    if (!formData.ingresos || formData.ingresos <= 0) newErrors.ingresos = 'Los ingresos deben ser mayores a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Actualizar el perfil del usuario usando el contexto
      const updatedData = {
        name: `${formData.nombre} ${formData.apellido}`.trim(),
        email: formData.email,
        phone: formData.telefono,
        document: formData.documento,
        documentType: formData.tipoDocumento,
        birthDate: formData.fechaNacimiento,
        gender: formData.genero,
        maritalStatus: formData.estadoCivil,
        occupation: formData.ocupacion,
        monthlyIncome: parseFloat(formData.ingresos) || 0,
        address: formData.direccion,
        city: formData.ciudad,
        department: formData.departamento,
        postalCode: formData.codigoPostal
      };

      const result = updateProfile(updatedData);
      if (result.success) {
        setIsEditing(false);
        console.log('Perfil actualizado:', result.user);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    
    // Restaurar los datos originales del usuario
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const nombre = nameParts[0] || '';
      const apellido = nameParts.slice(1).join(' ') || '';

      const monthlyIncome = user.monthlyIncome || '';
      
      setFormData({
        nombre,
        apellido,
        email: user.email || '',
        telefono: user.phone || '',
        documento: user.document || '',
        tipoDocumento: user.documentType || 'CC',
        fechaNacimiento: user.birthDate || '',
        genero: user.gender || 'Masculino',
        estadoCivil: user.maritalStatus || 'Soltero',
        ocupacion: user.occupation || '',
        ingresos: monthlyIncome,
        direccion: user.address || '',
        ciudad: user.city || '',
        departamento: user.department || '',
        codigoPostal: user.postalCode || ''
      });
      
      // Formatear ingresos al cancelar
      if (monthlyIncome) {
        setFormattedIncome(formatNumber(monthlyIncome));
      } else {
        setFormattedIncome('');
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Función helper para generar clases CSS consistentes para todos los campos
  const getFieldClasses = (fieldName, isSelect = false) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200';
    const stateClasses = isEditing ? 'bg-white' : 'bg-gray-50';
    const errorClasses = errors[fieldName] ? 'border-red-500' : 'border-gray-300';
    const disabledClasses = !isEditing ? 'cursor-not-allowed opacity-70' : 'cursor-text';
    
    return `${baseClasses} ${stateClasses} ${errorClasses} ${disabledClasses}`;
  };

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
              <p className="text-gray-600 mt-2">Gestiona tu información personal</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{formData.nombre} {formData.apellido}</h2>
                  <p className="text-blue-100">{formData.email}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Información Personal
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={getFieldClasses('nombre')}
                    />
                    {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={getFieldClasses('apellido')}
                    />
                    {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={getFieldClasses('email')}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={getFieldClasses('telefono')}
                    />
                    {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento
                      </label>
                      <select
                        name="tipoDocumento"
                        value={formData.tipoDocumento}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={getFieldClasses('tipoDocumento', true)}
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PP">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Documento *
                      </label>
                      <input
                        type="text"
                        name="documento"
                        value={formData.documento}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={getFieldClasses('documento')}
                      />
                      {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        max={new Date().toISOString().split('T')[0]}
                        className={`${getFieldClasses('fechaNacimiento')} pl-10 ${isEditing ? 'cursor-pointer' : ''}`}
                      />
                    </div>
                    {errors.fechaNacimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Género
                      </label>
                      <select
                        name="genero"
                        value={formData.genero}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={getFieldClasses('genero', true)}
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                        <option value="Prefiero no decir">Prefiero no decir</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado Civil
                      </label>
                      <select
                        name="estadoCivil"
                        value={formData.estadoCivil}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={getFieldClasses('estadoCivil', true)}
                      >
                        <option value="Soltero">Soltero</option>
                        <option value="Casado">Casado</option>
                        <option value="Divorciado">Divorciado</option>
                        <option value="Viudo">Viudo</option>
                        <option value="Unión Libre">Unión Libre</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Profesional y Ubicación */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Información Profesional
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ocupación
                    </label>
                    <input
                      type="text"
                      name="ocupacion"
                      value={formData.ocupacion}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={getFieldClasses('ocupacion')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingresos Mensuales (COP) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium">$</span>
                      </div>
                      <input
                        type="text"
                        name="ingresos"
                        value={formattedIncome}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="2.500.000"
                        className={`${getFieldClasses('ingresos')} pl-8`}
                      />
                    </div>
                    {errors.ingresos && <p className="text-red-500 text-sm mt-1">{errors.ingresos}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      El formato se aplica automáticamente
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mt-8">
                  Dirección
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={getFieldClasses('direccion')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={getFieldClasses('ciudad')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento
                      </label>
                      <input
                        type="text"
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={getFieldClasses('departamento')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={getFieldClasses('codigoPostal')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons for Mobile */}
            {isEditing && (
              <div className="md:hidden flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
