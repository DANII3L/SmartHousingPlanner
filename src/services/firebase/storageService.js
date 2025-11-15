import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';

export const uploadImage = async (file, folder = 'projects', onProgress = null) => {
  try {
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'El archivo debe ser una imagen' };
    }

    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      return { success: false, error: 'La imagen es muy grande. Tamaño máximo: 5MB' };
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
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
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ success: true, url: downloadURL });
          } catch (error) {
            resolve({ success: false, error: 'Error al obtener la URL de la imagen' });
          }
        }
      );
    });
  } catch (error) {
    return { success: false, error: 'Error al subir la imagen' };
  }
};

export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('firebasestorage')) {
      return { success: true };
    }

    const urlParts = imageUrl.split('/');
    const encodedPath = urlParts[urlParts.indexOf('o') + 1].split('?')[0];
    const decodedPath = decodeURIComponent(encodedPath);
    const storageRef = ref(storage, decodedPath);

    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return { success: true };
    }
    return { success: false, error: 'Error al eliminar la imagen' };
  }
};

export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'El archivo debe ser una imagen (JPG, PNG, GIF, etc.)' };
  }

  const maxSize = 5 * 1024 * 1024; 
  if (file.size > maxSize) {
    return { valid: false, error: 'La imagen es muy grande. Tamaño máximo: 5MB' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato de imagen no permitido. Use JPG, PNG, GIF o WEBP' };
  }

  return { valid: true };
};

