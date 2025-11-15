import React, { useState, useMemo, useCallback, useRef } from 'react';
import { createProject, updateProject } from '../../../services/firebase/projectsService';
import { uploadImage, validateImageFile, deleteImage } from '../../../services/firebase/storageService';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
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

// Valores iniciales del formulario
const getInitialFormData = (project = null) => {
  if (project) {
    return {
      name: project.name || '',
      location: project.location || '',
      apartments: project.apartments?.toString() || '',
      priceFrom: project.priceFrom?.toString() || '',
      image: project.image || '',
      status: project.status || 'Preventa',
      deliveryDate: project.deliveryDate || '',
      description: project.description || '',
      features: project.features?.join(', ') || '',
      featured: project.featured || false,
    };
  }
  return {
    name: '',
    location: '',
    apartments: '',
    priceFrom: '',
    image: '',
    status: 'Preventa',
    deliveryDate: '',
    description: '',
    features: '',
    featured: false,
  };
};

const ProjectFormModal = ({ isOpen, onClose, project = null, onSuccess }) => {
  const { showNotification } = useSweetAlert();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Inicializar formData basado en project (el componente se resetea con key prop)
  const [formData, setFormData] = useState(() => getInitialFormData(project));
  
  // Actualizar formData cuando cambia project (cuando se abre modal con diferente proyecto)
  React.useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData(project);
      setFormData(initialData);
      // Formatear precio inicial
      if (initialData.priceFrom) {
        setFormattedPrice(formatNumber(initialData.priceFrom));
      } else {
        setFormattedPrice('');
      }
      // Resetear imagen
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      setIsUploading(false);
      // Si hay imagen existente, mostrarla como preview
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [project, isOpen]);

  // Manejar cambios en campos de texto normales
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Si es el campo de precio, aplicar formato de moneda
    if (name === 'priceFrom') {
      const numericValue = parseFormattedNumber(value);
      const formatted = formatNumber(numericValue.toString());
      setFormattedPrice(formatted);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue.toString(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  }, []);

  const processFile = useCallback((file) => {
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      showNotification('error', 'Error', validation.error);
      return;
    }

    setImageFile(file);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, [showNotification]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processFile]);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setFormData((prev) => ({
      ...prev,
      image: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading && !isUploading) {
      setIsDragging(true);
    }
  }, [loading, isUploading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (loading || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [loading, isUploading, processFile]);

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      showNotification('error', 'Permisos insuficientes', 'Solo los administradores pueden crear o editar proyectos');
      return;
    }

    setLoading(true);
    let imageUrl = formData.image;

    try {
      if (imageFile) {
        setIsUploading(true);
        setUploadProgress(0);

        const uploadResult = await uploadImage(
          imageFile,
          'projects',
          (progress) => {
            setUploadProgress(progress);
          }
        );

        setIsUploading(false);

        if (!uploadResult.success) {
          showNotification('error', 'Error al subir imagen', uploadResult.error || 'Error al subir la imagen');
          setLoading(false);
          return;
        }

        imageUrl = uploadResult.url;

        if (project?.image && project.image !== imageUrl && project.image.includes('firebasestorage')) {
          await deleteImage(project.image);
        }
      } else if (!imageUrl && !project) {
        imageUrl = '/api/placeholder/300/200';
      }

      const projectData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        apartments: parseInt(formData.apartments) || 0,
        priceFrom: parseFloat(formData.priceFrom.replace(/[^\d]/g, '')) || 0,
        image: imageUrl,
        status: formData.status,
        deliveryDate: formData.deliveryDate,
        description: formData.description.trim(),
        features: formData.features
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f.length > 0),
        featured: formData.featured,
      };

      let result;
      if (project) {
        result = await updateProject(project.id, projectData);
        if (result.success) {
          showNotification('success', 'Proyecto actualizado', 'El proyecto se ha actualizado correctamente');
        } else {
          showNotification('error', 'Error', result.error || 'Error al actualizar proyecto');
        }
      } else {
        result = await createProject(projectData);
        if (result.success) {
          showNotification('success', 'Proyecto creado', 'El proyecto se ha creado correctamente');
        } else {
          showNotification('error', 'Error', result.error || 'Error al crear proyecto');
        }
      }

      if (result.success) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error al procesar proyecto:', error);
      showNotification('error', 'Error', 'Ocurrió un error al procesar la solicitud');
    } finally {
      setLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [formData, project, imageFile, onSuccess, onClose, showNotification, isAdmin]);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(59, 130, 246, 0.60)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {project ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Torres del Sol"
                />
              </div>

              {/* Ubicación */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Bogotá, Colombia"
                />
              </div>

              {/* Apartamentos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Apartamentos *
                </label>
                <input
                  type="number"
                  name="apartments"
                  value={formData.apartments}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio desde (COP) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">$</span>
                  </div>
                  <input
                    type="text"
                    name="priceFrom"
                    value={formattedPrice}
                    onChange={handleChange}
                    required
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="280.000.000"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  El formato se aplica automáticamente
                </p>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Preventa">Preventa</option>
                  <option value="En construcción">En construcción</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>

              {/* Fecha de entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Selecciona la fecha estimada de entrega
                </p>
              </div>

              {/* Imagen */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Proyecto *
                </label>
                
                {/* Preview de imagen */}
                {imagePreview && (
                  <div className="mb-4 relative">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-xl border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={loading || isUploading}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Input de archivo */}
                <div className="space-y-2">
                  <label
                    htmlFor="image-upload"
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      loading || isUploading
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : isDragging
                        ? 'border-blue-500 bg-blue-100 scale-105'
                        : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading || isUploading}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <>
                          <div className="relative w-16 h-16 mb-3">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                className="text-gray-200"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                                className="text-blue-500 transition-all duration-300"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">{uploadProgress}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">
                            Subiendo imagen...
                          </p>
                          <div className="w-48 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg
                            className={`w-10 h-10 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-blue-600">Click para subir</span> o arrastra y suelta
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF o WEBP (máx. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>

                  {/* Opción de URL alternativa */}
                  {!imagePreview && !imageFile && (
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        O ingresa una URL de imagen:
                      </label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción detallada del proyecto..."
                />
              </div>

              {/* Características */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Características (separadas por comas) *
                </label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Zonas verdes, Gimnasio, Piscina, Jardín infantil"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separa cada característica con una coma
                </p>
              </div>

              {/* Destacado */}
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                    Proyecto destacado
                  </label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-200"
              >
                {loading ? 'Guardando...' : project ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectFormModal;

