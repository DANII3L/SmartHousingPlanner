import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const USERS_COLLECTION = 'users';

export const findUserByDocument = async (documentNumber) => {
  try {
    const normalizedDocument = documentNumber?.toString().trim();
    if (!normalizedDocument) {
      return { success: false, error: 'Documento inválido' };
    }

    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('document', '==', normalizedDocument), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'No se encontró un usuario con ese documento' };
    }

    const docSnap = snapshot.docs[0];
    return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
  } catch (error) {
    console.error('Error al buscar usuario por documento:', error);
    return { success: false, error: 'Error al buscar usuario' };
  }
};

