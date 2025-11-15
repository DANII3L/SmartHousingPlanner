import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export const registerUser = async ({ name, email, password }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userData = {
      id: user.uid,
      name,
      email,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=150`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), userData);

    return { success: true, user: userData };
  } catch (error) {
    let errorMessage = 'Error al registrar usuario';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'El email ya está registrado';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'La contraseña es muy débil';
    }
    return { success: false, error: errorMessage };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    let userData;
    
    if (userDoc.exists()) {
      // Si existe, usar los datos del documento
      userData = userDoc.data();
    } else {
      // Si no existe, crear el documento en Firestore
      userData = {
        id: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=3b82f6&color=ffffff&size=150`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Crear el documento en Firestore
      await setDoc(userRef, userData);
    }

    return { success: true, user: userData };
  } catch (error) {
    let errorMessage = 'Error al iniciar sesión';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Usuario no encontrado';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Contraseña incorrecta';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido';
    }
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al cerrar sesión' };
  }
};

export const updateUserProfile = async (userId, updatedData) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Verificar si el email ha cambiado
    const emailChanged = updatedData.email && updatedData.email !== currentUser.email;
    let emailUpdateWarning = null;

    // Actualizar email en Firebase Authentication si ha cambiado
    if (emailChanged) {
      try {
        await updateEmail(currentUser, updatedData.email);
      } catch (emailError) {
        // Manejar errores específicos de actualización de email
        if (emailError.code === 'auth/requires-recent-login') {
          // Si requiere reautenticación reciente, continuar pero guardar el email en Firestore
          // y mostrar advertencia al usuario
          emailUpdateWarning = 'El email se guardó en tu perfil. Para que el cambio sea efectivo en la autenticación, necesitas cerrar sesión y volver a iniciar sesión.';
        } else if (emailError.code === 'auth/email-already-in-use') {
          // Si el email ya está en uso, no actualizar nada
          return { success: false, error: 'Este email ya está en uso por otra cuenta' };
        } else if (emailError.code === 'auth/invalid-email') {
          // Si el email no es válido, no actualizar nada
          return { success: false, error: 'El email proporcionado no es válido' };
        } else {
          // Otro error, continuar con la actualización de Firestore pero mostrar advertencia
          console.warn('Error al actualizar email en Authentication:', emailError);
          emailUpdateWarning = 'El email se guardó en tu perfil, pero hubo un problema al actualizarlo en la autenticación. Puedes intentar cerrar sesión y volver a iniciar sesión.';
        }
      }
    }

    // Verificar si el documento existe en Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Si no existe, crear el documento con los datos básicos del usuario
      const newUserData = {
        id: userId,
        name: updatedData.name || currentUser.displayName || currentUser.email || 'Usuario',
        email: updatedData.email || currentUser.email || '',
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedData.name || currentUser.displayName || currentUser.email || 'Usuario')}&background=3b82f6&color=ffffff&size=150`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updatedData,
      };
      
      await setDoc(userRef, newUserData);
    } else {
      // Si existe, actualizar el documento
      await updateDoc(userRef, {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      });
    }

    // Actualizar nombre en Firebase Authentication si ha cambiado
    if (updatedData.name && updatedData.name !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: updatedData.name });
    }

    // Obtener el documento actualizado
    const updatedUserDoc = await getDoc(userRef);
    
    // Retornar éxito con advertencia si hubo problema con el email
    const result = { success: true, user: updatedUserDoc.data() };
    if (emailUpdateWarning) {
      result.warning = emailUpdateWarning;
    }
    
    return result;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
    // Manejar error específico de documento no encontrado
    if (error.code === 'not-found' || error.message?.includes('No document to update')) {
      // Intentar crear el documento si no existe
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, 'users', userId);
          const newUserData = {
            id: userId,
            name: updatedData.name || currentUser.displayName || currentUser.email || 'Usuario',
            email: updatedData.email || currentUser.email || '',
            role: 'user',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedData.name || currentUser.displayName || currentUser.email || 'Usuario')}&background=3b82f6&color=ffffff&size=150`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...updatedData,
          };
          
          await setDoc(userRef, newUserData);
          const createdUserDoc = await getDoc(userRef);
          return { success: true, user: createdUserDoc.data() };
        }
      } catch (createError) {
        console.error('Error al crear documento de usuario:', createError);
      }
    }
    
    return { 
      success: false, 
      error: error.message || 'Error al actualizar perfil' 
    };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          resolve(userDoc.data());
        } else {
          resolve({
            id: user.uid,
            name: user.displayName || user.email,
            email: user.email,
            role: 'user',
          });
        }
      } else {
        resolve(null);
      }
    });
  });
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        callback(userDoc.data());
      } else {
        callback({
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
          role: 'user',
        });
      }
    } else {
      callback(null);
    }
  });
};

