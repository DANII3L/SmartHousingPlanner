import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserPayments,
  getPaymentById,
  addPaymentHistory,
  deletePayment,
  getUserFinancialSummary,
  updatePaymentHistoryEntry,
  deletePaymentHistoryEntry,
} from '../services/firebase/paymentsService';

export const useFirebasePayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPayments = useCallback(async () => {
    if (!user?.id) {
      setPayments([]);
      return;
    }

    try {
      const result = await getUserPayments(user.id);
      if (result.success) {
        setPayments(result.data);
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al cargar pagos');
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setPayments([]);
      setLoading(false);
      return;
    }

    const loadPayments = async () => {
      try {
        setLoading(true);
        await refreshPayments();
      } catch (err) {
        setError('Error al cargar pagos');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [refreshPayments, user?.id]);

  const addPaymentHistoryEntry = async (paymentId, historyData) => {
    try {
      const result = await addPaymentHistory(paymentId, historyData);
      if (result.success && user?.id) {
        await refreshPayments();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Error al agregar historial' };
    }
  };

  const deleteExistingPayment = async (paymentId) => {
    try {
      const result = await deletePayment(paymentId);
      if (result.success && user?.id) {
        await refreshPayments();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Error al eliminar pago' };
    }
  };

  const updatePaymentHistory = async (historyId, historyData) => {
    try {
      const result = await updatePaymentHistoryEntry(historyId, historyData);
      if (result.success) {
        await refreshPayments();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Error al actualizar historial' };
    }
  };

  const removePaymentHistory = async (historyId) => {
    try {
      const result = await deletePaymentHistoryEntry(historyId);
      if (result.success) {
        await refreshPayments();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Error al eliminar historial' };
    }
  };

  return {
    payments,
    loading,
    error,
    addPaymentHistory: addPaymentHistoryEntry,
    updatePaymentHistory,
    deletePaymentHistory: removePaymentHistory,
    deletePayment: deleteExistingPayment,
    refetch: refreshPayments,
  };
};

export const useFinancialSummary = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setSummary(null);
      setLoading(false);
      return;
    }

    const loadSummary = async () => {
      try {
        setLoading(true);
        const result = await getUserFinancialSummary(user.id);
        if (result.success) {
          setSummary(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Error al cargar resumen financiero');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [user?.id]);

  return { summary, loading, error };
};

export const usePayment = (paymentId) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    const loadPayment = async () => {
      try {
        setLoading(true);
        const result = await getPaymentById(paymentId);
        if (result.success) {
          setPayment(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Error al cargar pago');
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [paymentId]);

  return { payment, loading, error };
};

