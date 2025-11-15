import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllProjects } from '../services/firebase/projectsService';
import { createAssociation } from '../services/firebase/associationsService';
import {
  addPaymentHistory,
  updatePaymentHistoryEntry,
  deletePaymentHistoryEntry,
  getAllPayments,
} from '../services/firebase/paymentsService';
import { getSimulationByProject, getSimulationById } from '../services/firebase/simulationsService';
import { findUserByDocument } from '../services/firebase/usersService';
import { buildSimulationSummary, calculatePaymentStats } from '../utils/simulationMetrics';

export const MONTH_OPTIONS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const MONTH_LABEL_TO_VALUE = MONTH_OPTIONS.reduce((acc, option) => {
  acc[option.label.toLowerCase()] = option.value;
  return acc;
}, {});

const getDefaultMonth = () => MONTH_OPTIONS[new Date().getMonth()]?.value ?? '01';
const getDefaultYear = () => new Date().getFullYear().toString();
const createEmptyPaymentForm = () => ({
  month: getDefaultMonth(),
  year: getDefaultYear(),
  amount: '',
  notes: '',
});

const extractMonthlyPayment = (simulation) =>
  Number(
    simulation?.calculation?.monthlyPayment ??
      simulation?.monthlyPayment ??
      simulation?.calculation?.paymentPerMonth ??
      0,
  );

const roundCurrency = (value) => Math.round(Number(value) || 0);

export const useAdminPayments = () => {
  const [firebaseProjects, setFirebaseProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const [associations, setAssociations] = useState([]);
  const [associationsLoading, setAssociationsLoading] = useState(true);
  const [associationsError, setAssociationsError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState(() => createEmptyPaymentForm());
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState(null);
  const [documentQuery, setDocumentQuery] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [assignFeedback, setAssignFeedback] = useState(null);
  const [simulationDetails, setSimulationDetails] = useState(null);
  const [isSimulationLoading, setIsSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState(null);

  const resetAssignState = useCallback(() => {
    setDocumentQuery('');
    setFoundUser(null);
    setAssignFeedback(null);
    setIsSearchingUser(false);
    setIsAssigningUser(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      setProjectsLoading(true);
      const result = await getAllProjects();
      if (!mounted) {
        return;
      }
      if (result.success) {
        setFirebaseProjects(result.data ?? []);
        setProjectError(null);
      } else {
        setFirebaseProjects([]);
        setProjectError(result.error || 'Error al cargar proyectos');
      }
      setProjectsLoading(false);
    };
    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const loadAssociations = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setAssociationsLoading(true);
    }
    try {
      const result = await getAllPayments();
      if (result.success) {
        setAssociations(result.data ?? []);
        setAssociationsError(null);
      } else {
        setAssociations([]);
        setAssociationsError(result.error || 'Error al cargar asociaciones');
      }
    } catch (error) {
      setAssociations([]);
      setAssociationsError('Error al cargar asociaciones');
    } finally {
      if (showLoader) {
        setAssociationsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadAssociations(true);
  }, [loadAssociations]);

  const paymentsByProject = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(associations)) {
      return map;
    }
    associations.forEach((association) => {
      const projectId = association.projectId;
      if (!projectId) {
        return;
      }
      if (!map.has(projectId)) {
        map.set(projectId, { users: [] });
      }
      map.get(projectId).users.push({
        paymentId: association.id,
        userId: association.userId,
        userName: association.userName || association.userEmail || 'Usuario sin nombre',
        userEmail: association.userEmail || '',
        monthlyPayment: Number(association.monthlyPayment) || 0,
        paymentHistory: (association.paymentHistory || []).map((entry) => {
          const normalizedRequired = Number(
            entry.required ?? entry.expected ?? association.monthlyPayment ?? 0,
          );
          const normalizedActual = Number(entry.actual ?? entry.amount ?? entry.value ?? 0);
          return {
            ...entry,
            required: normalizedRequired,
            actual: normalizedActual,
          };
        }),
      });
    });
    return map;
  }, [associations]);

  const activeProject = useMemo(() => {
    if (!selectedProjectId) {
      return null;
    }
    return firebaseProjects.find((project) => project.id === selectedProjectId) || null;
  }, [firebaseProjects, selectedProjectId]);

  const activeUsers = useMemo(() => {
    if (!activeProject) {
      return [];
    }
    return paymentsByProject.get(activeProject.id)?.users ?? [];
  }, [activeProject, paymentsByProject]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) {
      return null;
    }
    return activeUsers.find((user) => user.paymentId === selectedUserId) || null;
  }, [activeUsers, selectedUserId]);

  const assignProject = useMemo(() => {
    if (!assignProjectId) {
      return null;
    }
    return firebaseProjects.find((project) => project.id === assignProjectId) || null;
  }, [firebaseProjects, assignProjectId]);

  const assignProjectUsers = useMemo(() => {
    if (!assignProjectId) {
      return [];
    }
    return paymentsByProject.get(assignProjectId)?.users ?? [];
  }, [assignProjectId, paymentsByProject]);

  useEffect(() => {
    if (!activeUsers.length) {
      setSelectedUserId(null);
      return;
    }
    if (!selectedUserId || !activeUsers.some((user) => user.paymentId === selectedUserId)) {
      setSelectedUserId(activeUsers[0].paymentId);
    }
  }, [activeUsers, selectedUserId]);

  useEffect(() => {
    setFormData(createEmptyPaymentForm());
    setEditingHistoryId(null);
    setFeedback(null);
  }, [selectedUserId]);

  useEffect(() => {
    let active = true;
    const loadSimulationDetails = async () => {
      if (!selectedUser?.userId || !activeProject?.id) {
        setSimulationDetails(null);
        setSimulationError(null);
        return;
      }
      setIsSimulationLoading(true);
      setSimulationError(null);
      try {
        let result = null;
        if (selectedUser.simulationId) {
          result = await getSimulationById(selectedUser.simulationId);
        } else {
          result = await getSimulationByProject(selectedUser.userId, activeProject.id);
        }

        if (!active) {
          return;
        }

        if (result.success && result.data) {
          setSimulationDetails(result.data);
          setSimulationError(null);
        } else {
          setSimulationDetails(null);
          setSimulationError('No se encontró una simulación registrada para este usuario.');
        }
      } catch (error) {
        if (!active) {
          return;
        }
        setSimulationDetails(null);
        setSimulationError('No se pudo cargar la simulación del usuario.');
      } finally {
        if (active) {
          setIsSimulationLoading(false);
        }
      }
    };

    loadSimulationDetails();
    return () => {
      active = false;
    };
  }, [selectedUser?.simulationId, selectedUser?.userId, activeProject?.id]);

  const simulationSummary = useMemo(() => buildSimulationSummary(simulationDetails), [simulationDetails]);

  const history = useMemo(() => selectedUser?.paymentHistory || [], [selectedUser?.paymentId]);
  const hasSimulationForProject = Boolean(simulationSummary);

  const { monthlyRequired, totalPaid, totalExpected, remainingBalance } = useMemo(
    () =>
      calculatePaymentStats({
        summary: simulationSummary,
        simulationDetails,
        paymentHistory: history,
        fallbackMonthlyPayment: selectedUser?.monthlyPayment,
        fallbackRemainingMonths: selectedUser?.remainingMonths,
      }),
    [
      simulationSummary,
      simulationDetails,
      history,
      selectedUser?.monthlyPayment,
      selectedUser?.remainingMonths,
    ],
  );

  const chartData = useMemo(() => {
    const parseEntryDate = (entry) => {
      if (entry.date) {
        return new Date(entry.date);
      }
      if (entry.label) {
        const [monthLabel, yearValue] = entry.label.split(' ');
        const monthValue = MONTH_LABEL_TO_VALUE[monthLabel?.toLowerCase()] || '01';
        return new Date(`${yearValue || '1970'}-${monthValue}-01`);
      }
      return new Date('1970-01-01');
    };

    const rows = history
      .map((entry) => {
        const label =
          entry.label ||
          (entry.date
            ? new Date(entry.date).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
            : 'Periodo');
        const requiredValue = roundCurrency(entry.required ?? entry.expected ?? monthlyRequired ?? 0);
        const actualValue = Number(entry.actual ?? entry.amount ?? entry.value ?? 0) || 0;
        const sortDate = parseEntryDate(entry).getTime();
        return { label, requiredValue, actualValue, sortDate };
      })
      .sort((a, b) => a.sortDate - b.sortDate)
      .map((entry) => [entry.label, entry.requiredValue, entry.actualValue]);

    return [['Periodo', 'Pago requerido', 'Pago realizado'], ...rows];
  }, [history, monthlyRequired]);

  const yearOptions = useMemo(() => {
    const baseYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, idx) => (baseYear - 2 + idx).toString());
  }, []);

  const handleOpenModal = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProjectId(null);
    setSelectedUserId(null);
    setFormData(createEmptyPaymentForm());
    setEditingHistoryId(null);
    setFeedback(null);
  }, []);

  const handleSelectUser = useCallback((paymentId) => {
    setSelectedUserId(paymentId || null);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAssignModal = useCallback(
    (projectId = null) => {
      const fallbackProjectId = projectId ?? selectedProjectId ?? firebaseProjects[0]?.id ?? null;
      setAssignProjectId(fallbackProjectId);
      resetAssignState();
      setIsAssignModalOpen(true);
    },
    [firebaseProjects, resetAssignState, selectedProjectId],
  );

  const handleCloseAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
    resetAssignState();
  }, [resetAssignState]);

  const handleDocumentQueryChange = (event) => {
    setDocumentQuery(event.target.value);
    setAssignFeedback(null);
    setFoundUser(null);
  };

  const handleSearchUser = async () => {
    if (!assignProjectId) {
      setAssignFeedback({ type: 'error', message: 'Selecciona un proyecto para continuar' });
      setFoundUser(null);
      return;
    }

    const normalizedDocument = documentQuery.trim();
    if (!normalizedDocument) {
      setAssignFeedback({ type: 'error', message: 'Ingresa un número de documento' });
      setFoundUser(null);
      return;
    }

    setAssignFeedback(null);
    setFoundUser(null);
    setIsSearchingUser(true);
    const result = await findUserByDocument(normalizedDocument);
    setIsSearchingUser(false);

    if (result.success) {
      if (assignProjectUsers.some((user) => user.userId === result.data.id)) {
        setAssignFeedback({ type: 'warning', message: 'Este usuario ya está registrado en el proyecto' });
        return;
      }
      setFoundUser(result.data);
      setAssignFeedback({ type: 'success', message: `Usuario encontrado: ${result.data.name}` });
    } else {
      setAssignFeedback({ type: 'error', message: result.error || 'No se encontró un usuario con ese documento' });
    }
  };

  const handleAssignUserToProject = async () => {
    if (!assignProject || !foundUser) {
      setAssignFeedback({ type: 'error', message: 'Selecciona un proyecto y busca un usuario válido' });
      return;
    }

    if (assignProjectUsers.some((user) => user.userId === foundUser.id)) {
      setAssignFeedback({ type: 'warning', message: 'Este usuario ya está asignado al proyecto' });
      return;
    }

    const simulationResult = await getSimulationByProject(foundUser.id, assignProject.id);
    if (!simulationResult.success) {
      setAssignFeedback({
        type: 'error',
        message: 'No fue posible verificar la simulación del usuario. Intenta nuevamente.',
      });
      return;
    }

    if (!simulationResult.data) {
      setAssignFeedback({
        type: 'error',
        message: 'Debes registrar la simulación del usuario para este proyecto antes de asociarlo.',
      });
      return;
    }

    const normalizedMonthlyPayment = extractMonthlyPayment(simulationResult.data);
    if (!normalizedMonthlyPayment) {
      setAssignFeedback({
        type: 'error',
        message: 'La simulación no tiene un valor mensual calculado. Revisa el cálculo antes de continuar.',
      });
      return;
    }

    const paymentPayload = {
      projectId: assignProject.id,
      name: assignProject.name,
      projectName: assignProject.name,
      location: assignProject.location,
      status: assignProject.status || 'En seguimiento',
      price: Number(assignProject.price ?? assignProject.priceFrom ?? 0),
      priceFrom: Number(assignProject.priceFrom ?? assignProject.price ?? 0),
      monthlyPayment: normalizedMonthlyPayment,
      remainingMonths: assignProject.remainingMonths ?? assignProject.deliveryMonths ?? 0,
      subsidy: Number(assignProject.subsidy ?? 0),
      userName: foundUser.name,
      userEmail: foundUser.email,
      userDocument: foundUser.document || '',
      userId: foundUser.id,
      simulationId: simulationResult.data.id,
    };

    setIsAssigningUser(true);
    setAssignFeedback(null);
    const result = await createAssociation(paymentPayload);

    if (result.success) {
      await loadAssociations();
      const newlyCreatedPaymentId = result.id || null;
      setSelectedProjectId(assignProject.id);
      setSelectedUserId(newlyCreatedPaymentId);
      setIsModalOpen(true);
      setIsAssignModalOpen(false);
      resetAssignState();
    } else {
      setAssignFeedback({ type: 'error', message: result.error || 'No se pudo registrar el usuario' });
    }
    setIsAssigningUser(false);
  };

  const parseEntryPeriod = (entry) => {
    if (entry.date) {
      const date = new Date(entry.date);
      return {
        month: String(date.getMonth() + 1).padStart(2, '0'),
        year: date.getFullYear().toString(),
      };
    }
    if (entry.label) {
      const [monthLabel, yearValue] = entry.label.split(' ');
      return {
        month: MONTH_LABEL_TO_VALUE[monthLabel?.toLowerCase()] || getDefaultMonth(),
        year: yearValue || getDefaultYear(),
      };
    }
    return { month: getDefaultMonth(), year: getDefaultYear() };
  };

  const handleEditEntry = (entry) => {
    const period = parseEntryPeriod(entry);
    setFormData({
      month: period.month,
      year: period.year,
      amount: entry.actual?.toString() ?? '',
      notes: entry.notes || '',
    });
    setEditingHistoryId(entry.id);
    setFeedback(null);
  };

  const resetPaymentForm = useCallback(() => {
    setFormData(createEmptyPaymentForm());
    setEditingHistoryId(null);
    setFeedback(null);
  }, []);

  const handleDeleteEntry = useCallback(
    async (entry) => {
      if (!entry?.id) {
        return;
      }
      if (!window.confirm('¿Deseas eliminar este registro de pago?')) {
        return;
      }
      setIsSaving(true);
      const result = await deletePaymentHistoryEntry(entry.id);
      setIsSaving(false);
      setFeedback(
        result.success
          ? { type: 'success', message: 'Registro eliminado correctamente' }
          : { type: 'error', message: result.error || 'No se pudo eliminar el registro' },
      );
      if (result.success) {
        resetPaymentForm();
        await loadAssociations();
      }
    },
    [loadAssociations, resetPaymentForm],
  );

  const buildLabelFromPeriod = () => {
    const monthLabel = MONTH_OPTIONS.find((option) => option.value === formData.month)?.label;
    return monthLabel ? `${monthLabel} ${formData.year}` : formData.year;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedUser?.paymentId) {
      setFeedback({ type: 'error', message: 'Selecciona un usuario para registrar pagos' });
      return;
    }
    if (!selectedUser?.monthlyPayment) {
      setFeedback({
        type: 'error',
        message: 'Este usuario no tiene una simulación con cuota mensual. Regístrala antes de continuar.',
      });
      return;
    }
    if (!hasSimulationForProject) {
      setFeedback({
        type: 'error',
        message: 'Debes registrar la simulación del usuario para este proyecto antes de registrar pagos.',
      });
      return;
    }
    if (!formData.month || !formData.year || !formData.amount) {
      setFeedback({ type: 'error', message: 'Selecciona mes, año y valor del pago' });
      return;
    }

    const payload = {
      label: buildLabelFromPeriod(),
      required: roundCurrency(monthlyRequired),
      actual: Number(formData.amount) || 0,
      date: `${formData.year}-${formData.month}-01`,
      notes: formData.notes.trim(),
    };

    setIsSaving(true);
    const result = editingHistoryId
      ? await updatePaymentHistoryEntry(editingHistoryId, payload)
      : await addPaymentHistory(selectedUser.paymentId, payload);
    setIsSaving(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: editingHistoryId ? 'Registro actualizado correctamente' : 'Pago registrado correctamente',
      });
      setFormData(createEmptyPaymentForm());
      setEditingHistoryId(null);
      await loadAssociations();
    } else {
      setFeedback({ type: 'error', message: result.error || 'No se pudo guardar el pago' });
    }
  };

  return {
    firebaseProjects,
    projectsLoading,
    projectError,
    associationsLoading,
    associationsError,
    activeProject,
    activeUsers,
    selectedUser,
    selectedUserId,
    simulationSummary,
    monthlyRequired,
    history,
    hasSimulationForProject,
    totalPaid,
    totalExpected,
    remainingBalance,
    chartData,
    yearOptions,
    formData,
    editingHistoryId,
    feedback,
    isSaving,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    handleSelectUser,
    handleInputChange,
    selectedProjectId,
    setSelectedProjectId,
    isAssignModalOpen,
    handleOpenAssignModal,
    handleCloseAssignModal,
    assignProjectId,
    setAssignProjectId,
    documentQuery,
    handleDocumentQueryChange,
    handleSearchUser,
    isSearchingUser,
    foundUser,
    handleAssignUserToProject,
    isAssigningUser,
    assignFeedback,
    assignProject,
    isSimulationLoading,
    simulationError,
    handleEditEntry,
    handleDeleteEntry,
    handleSubmit,
    setFormData,
    setEditingHistoryId,
    setFeedback,
    setSelectedUserId,
    resetPaymentForm,
  };
};


