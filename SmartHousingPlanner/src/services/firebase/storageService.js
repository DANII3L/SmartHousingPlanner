import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';

/**
 * Sube un archivo de imagen a Firebase Storage
 * @param {File} file - Archivo de imagen a subir
 * @param {string} folder - Carpeta donde se guardará (ej: 'projects', 'users')
 * @param {Function} onProgress - Callback para el progreso de la subida (0-100)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImage = async (file, folder = 'projects', onProgress = null) => {
  try {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'El archivo debe ser una imagen' };
    }

    // Validar tamaño máximo (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return { success: false, error: 'La imagen es muy grande. Tamaño máximo: 5MB' };
    }

    // Crear referencia única para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Subir archivo con control de progreso
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calcular progreso
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          // Error durante la subida
          console.error('Error al subir imagen:', error);
          let errorMessage = 'Error al subir la imagen';
          if (error.code === 'storage/unauthorized') {
            errorMessage = 'No tienes permisos para subir archivos';
          } else if (error.code === 'storage/canceled') {
            errorMessage = 'La subida fue cancelada';
          } else if (error.code === 'storage/unknown') {
            errorMessage = 'Error desconocido al subir la imagen';
          }
          resolve({ success: false, error: errorMessage });
        },
        async () => {
          // Subida completada, obtener URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ success: true, url: downloadURL });
          } catch (error) {
            console.error('Error al obtener URL de la imagen:', error);
            resolve({ success: false, error: 'Error al obtener la URL de la imagen' });
          }
        }
      );
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return { success: false, error: 'Error al subir la imagen' };
  }
};

/**
 * Elimina una imagen de Firebase Storage
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('firebasestorage')) {
      // No es una imagen de Firebase Storage, no intentar eliminarla
      return { success: true };
    }

    // Extraer la ruta del archivo de la URL
    const urlParts = imageUrl.split('/');
    const encodedPath = urlParts[urlParts.indexOf('o') + 1].split('?')[0];
    const decodedPath = decodeURIComponent(encodedPath);
    const storageRef = ref(storage, decodedPath);

    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    // No fallar si la imagen ya no existe
    if (error.code === 'storage/object-not-found') {
      return { success: true };
    }
    return { success: false, error: 'Error al eliminar la imagen' };
  }
};

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {{valid: boolean, error?: string}}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'El archivo debe ser una imagen (JPG, PNG, GIF, etc.)' };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'La imagen es muy grande. Tamaño máximo: 5MB' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato de imagen no permitido. Use JPG, PNG, GIF o WEBP' };
  }

  return { valid: true };
};

