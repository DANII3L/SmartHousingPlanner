import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAllAssociations, getAssociationsByUser } from './associationsService';
import { mapSnapshot, sortByTimestamp } from './utils';

const PAYMENTS_COLLECTION = 'payments';
const ASSOCIATIONS_COLLECTION = 'associations';

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
    if (!userId) {
      return { success: true, data: [] };
    }

    const associationsResult = await getAssociationsByUser(userId);
    if (!associationsResult.success) {
      return { success: false, error: associationsResult.error || 'Error al obtener asociaciones del usuario' };
    }
    const associations = sortByTimestamp(associationsResult.data ?? []);
    const enriched = await enrichAssociationsWithHistory(associations);
    return { success: true, data: enriched };
  } catch (error) {
    return { success: false, error: 'Error al obtener pagos' };
  }
};

export const getAllPayments = async () => {
  try {
    const associationsResult = await getAllAssociations();
    if (!associationsResult.success) {
      return { success: false, error: associationsResult.error || 'Error al obtener asociaciones' };
    }
    const associations = sortByTimestamp(associationsResult.data ?? []);
    const enriched = await enrichAssociationsWithHistory(associations);
    return { success: true, data: enriched };
  } catch (error) {
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
    return { success: false, error: 'Error al guardar pago' };
  }
};

export const getPaymentHistory = async (associationId) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const snapshot = await getDocs(query(paymentsRef, where('associationId', '==', associationId)));
    const history = sortByTimestamp(mapSnapshot(snapshot), ['date', 'createdAt']);
    return { success: true, data: history };
  } catch (error) {
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
    return { success: false, error: 'Error al actualizar pago' };
  }
};

export const deletePaymentHistoryEntry = async (paymentId) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await deleteDoc(paymentRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al eliminar pago' };
  }
};

export const deletePayment = async (associationId) => {
  try {
    const paymentsRef = collection(db, PAYMENTS_COLLECTION);
    const snapshot = await getDocs(query(paymentsRef, where('associationId', '==', associationId)));
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    const associationRef = doc(db, ASSOCIATIONS_COLLECTION, associationId);
    batch.delete(associationRef);
    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al eliminar asociación y pagos' };
  }
};

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
      
      const totalPaidInHistory = payment.paymentHistory?.reduce(
        (acc, hist) => acc + (hist.actual || 0),
        0
      ) || 0;
      summary.totalPaid += totalPaidInHistory;
      
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
    return { success: false, error: 'Error al obtener resumen financiero' };
  }
};

