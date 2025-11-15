import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const PAYMENTS_COLLECTION = 'payments';
const ASSOCIATIONS_COLLECTION = 'associations';
const mapWithId = (snapshot) =>
  snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

const enrichAssociationsWithHistory = async (associations) => {
  const enriched = await Promise.all(
    associations.map(async (association) => {
      const historyResult = await getPaymentHistory(association.id);
      const paymentHistory = historyResult.success ? historyResult.data : [];
      return { ...association, paymentHistory };
    }),
  );
  return enriched;
};

export const getUserPayments = async (userId) => {
  try {
    const associationsRef = collection(db, ASSOCIATIONS_COLLECTION);
    const snapshot = await getDocs(
      query(associationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc')),
    );
    const associations = mapWithId(snapshot);
    const enriched = await enrichAssociationsWithHistory(associations);
    return { success: true, data: enriched };
  } catch (error) {
    console.error('Error al obtener pagos del usuario:', error);
    return { success: false, error: 'Error al obtener pagos' };
  }
};

export const getAllPayments = async () => {
  try {
    const associationsRef = collection(db, ASSOCIATIONS_COLLECTION);
    const snapshot = await getDocs(query(associationsRef, orderBy('createdAt', 'desc')));
    const associations = mapWithId(snapshot);
    const enriched = await enrichAssociationsWithHistory(associations);
    return { success: true, data: enriched };
  } catch (error) {
    console.error('Error al obtener todos los pagos:', error);
    return { success: false, error: 'Error al obtener pagos' };
  }
};

export const getPaymentById = async (associationId) => {
  try {
    const associationRef = doc(db, ASSOCIATIONS_COLLECTION, associationId);
    const associationSnap = await getDoc(associationRef);
    if (!associationSnap.exists()) {
      return { success: false, error: 'Asociación no encontrada' };
    }
    const association = { id: associationSnap.id, ...associationSnap.data() };
    const historyResult = await getPaymentHistory(associationId);
    return {
      success: true,
      data: { ...association, paymentHistory: historyResult.data || [] },
    };
  } catch (error) {
    console.error('Error al obtener pagos por asociación:', error);
    return { success: false, error: 'Error al obtener información de pagos' };
  }
};

export const addPaymentHistory = async (associationId, historyData) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const payload = {
      associationId,
      ...historyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(paymentsRef, payload);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al guardar pago:', error);
    return { success: false, error: 'Error al guardar pago' };
  }
};

export const getPaymentHistory = async (associationId) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const snapshot = await getDocs(query(paymentsRef, where('associationId', '==', associationId)));
    const history = snapshot.docs
      .map((document) => ({ id: document.id, ...document.data() }))
      .sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    return { success: true, data: history };
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    return { success: false, error: 'Error al obtener historial de pagos' };
  }
};

export const updatePaymentHistoryEntry = async (paymentId, historyData) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      ...historyData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    return { success: false, error: 'Error al actualizar pago' };
  }
};

export const deletePaymentHistoryEntry = async (paymentId) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await deleteDoc(paymentRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    return { success: false, error: 'Error al eliminar pago' };
  }
};

export const deletePayment = async (associationId) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const snapshot = await getDocs(query(paymentsRef, where('associationId', '==', associationId)));
    const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletions);
    const associationRef = doc(db, ASSOCIATIONS_COLLECTION, associationId);
    await deleteDoc(associationRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar asociación y pagos:', error);
    return { success: false, error: 'Error al eliminar asociación y pagos' };
  }
};

// Obtener resumen financiero del usuario
export const getUserFinancialSummary = async (userId) => {
  try {
    const payments = await getUserPayments(userId);
    
    if (!payments.success) {
      return { success: false, error: payments.error };
    }
    
    const summary = {
      totalValue: 0,
      totalPaid: 0,
      totalPending: 0,
      totalSubsidies: 0,
      nextPayment: null,
      projectsCount: payments.data.length,
    };
    
    payments.data.forEach((payment) => {
      summary.totalValue += payment.price || 0;
      summary.totalSubsidies += payment.subsidy || 0;
      
      // Calcular total pagado del historial
      const totalPaidInHistory = payment.paymentHistory?.reduce(
        (acc, hist) => acc + (hist.actual || 0),
        0
      ) || 0;
      summary.totalPaid += totalPaidInHistory;
      
      // Encontrar próximo pago
      if (!summary.nextPayment || payment.monthlyPayment) {
        summary.nextPayment = {
          amount: payment.monthlyPayment,
          projectName: payment.name,
          paymentId: payment.id,
        };
      }
    });
    
    summary.totalPending = summary.totalValue - summary.totalPaid;
    
    return { success: true, data: summary };
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);
    return { success: false, error: 'Error al obtener resumen financiero' };
  }
};

