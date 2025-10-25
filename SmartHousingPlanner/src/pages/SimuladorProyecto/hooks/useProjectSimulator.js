import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';

export const useProjectSimulator = (project) => {
  const [formData, setFormData] = useState({
    projectValue: project?.priceFrom || 280000000,
    downPayment: 0,
    monthlyIncome: 0,
    hasSubsidy: false,
    subsidyAmount: 0,
    hasCesantias: false,
    cesantiasAmount: 0,
    hasPrima: false,
    primaAmount: 0,
    creditTerm: 20,
    interestRate: 1.7
  });

  const [calculation, setCalculation] = useState(null);
  const [inputError, setInputError] = useState('');
  const [formattedValues, setFormattedValues] = useState({
    downPayment: '',
    subsidyAmount: '',
    cesantiasAmount: '',
    primaAmount: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return '';
    const cleanValue = value.toString().replace(/[^\d]/g, '');
    const number = parseFloat(cleanValue);
    return isNaN(number) ? '' : number.toLocaleString('es-CO');
  };

  const parseFormattedNumber = (value) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    return cleanValue ? parseFloat(cleanValue) : 0;
  };

  const calculateFinancing = useCallback(() => {
    const {
      projectValue,
      downPayment,
      subsidyAmount,
      cesantiasAmount,
      primaAmount,
      creditTerm,
      interestRate,
      hasCesantias,
      hasPrima
    } = formData;

    const requiredDownPayment = projectValue * 0.30;
    
    const totalAvailable = downPayment + subsidyAmount;
    
    const maxCesantiasPerYear = projectValue / creditTerm;
    const maxPrimaPerYear = projectValue / (creditTerm * 2);
    
    const limitedCesantiasAmount = hasCesantias && cesantiasAmount > 0 ? Math.min(cesantiasAmount, maxCesantiasPerYear) : 0;
    const limitedPrimaAmount = hasPrima && primaAmount > 0 ? Math.min(primaAmount, maxPrimaPerYear) : 0;
    
    const totalCesantiasAmount = limitedCesantiasAmount > 0 ? limitedCesantiasAmount * creditTerm : 0;
    const totalPrimaAmount = limitedPrimaAmount > 0 ? limitedPrimaAmount * creditTerm * 2 : 0;
    
    const totalResourcesAvailable = totalAvailable + totalCesantiasAmount + totalPrimaAmount;
    
    let creditAmount = projectValue - totalResourcesAvailable;
    
    if (creditAmount < 0) {
      creditAmount = 0;
    }

    const monthlyRate = (interestRate / 100) / 12;
    const totalMonths = creditTerm * 12;

    let monthlyPayment = 0;
    if (creditAmount > 0) {
      if (monthlyRate > 0) {
        monthlyPayment = creditAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);
      } else {
        monthlyPayment = creditAmount / totalMonths;
      }
    }


    const baseTotalPayments = monthlyPayment * totalMonths;
    const totalInterest = baseTotalPayments - creditAmount;
    const totalPayments = baseTotalPayments + totalCesantiasAmount + totalPrimaAmount;

    setCalculation({
      projectValue,
      requiredDownPayment,
      totalAvailable: totalResourcesAvailable,
      creditAmount,
      monthlyPayment,
      totalPayments,
      totalInterest,
      totalMonths,
      subsidyAmount,
      cesantiasAmount: hasCesantias ? limitedCesantiasAmount : 0,
      primaAmount: hasPrima ? limitedPrimaAmount : 0,
      totalCesantiasAmount,
      totalPrimaAmount,
      hasCesantias,
      hasPrima
    });
  }, [
    formData.projectValue,
    formData.downPayment,
    formData.subsidyAmount,
    formData.cesantiasAmount,
    formData.primaAmount,
    formData.creditTerm,
    formData.interestRate,
    formData.hasCesantias,
    formData.hasPrima
  ]);

  const showExcessAlert = (totalSum, projectValue) => {
    Swal.fire({
      title: 'Valor de vivienda presupuestado alcanzado',
      text: `La suma total (${formatCurrency(totalSum)}) no puede exceder el valor del proyecto (${formatCurrency(projectValue)})`,
      icon: 'warning',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const handleInputChange = (field, value) => {
    const monetaryFields = ['downPayment', 'subsidyAmount', 'cesantiasAmount', 'primaAmount'];
    const initialResourceFields = ['downPayment', 'subsidyAmount'];

    if (monetaryFields.includes(field)) {
      const numValue = parseFormattedNumber(value);

      if (initialResourceFields.includes(field) && numValue > formData.projectValue) {
        const fieldNames = {
          'downPayment': 'La cuota inicial',
          'subsidyAmount': 'El subsidio'
        };
        setInputError(`${fieldNames[field]} no puede exceder el valor del proyecto`);
        setTimeout(() => setInputError(''), 3000);

        const maxValue = formatNumber(formData.projectValue.toString());
        setFormattedValues(prev => ({
          ...prev,
          [field]: maxValue
        }));
        setFormData(prev => ({
          ...prev,
          [field]: formData.projectValue
        }));
        return;
      } else {
        setInputError('');
      }

      let newDownPayment = field === 'downPayment' ? numValue : formData.downPayment;
      let newSubsidyAmount = field === 'subsidyAmount' ? numValue : formData.subsidyAmount;
      
      if (initialResourceFields.includes(field)) {
        const totalSum = newDownPayment + newSubsidyAmount;
        
        if (totalSum > formData.projectValue) {
          showExcessAlert(totalSum, formData.projectValue);
          
          const revertedValue = formatNumber(formData[field].toString());
          setFormattedValues(prev => ({
            ...prev,
            [field]: revertedValue
          }));
          return;
        }
      }

      if (field === 'cesantiasAmount' && formData.hasCesantias && numValue > 0) {
        const maxCesantiasPerYear = formData.projectValue / formData.creditTerm;
        if (numValue > maxCesantiasPerYear) {
          setInputError(`Las cesantías no pueden exceder ${formatCurrency(maxCesantiasPerYear)} por año`);
          setTimeout(() => setInputError(''), 3000);
          const maxValue = formatNumber(maxCesantiasPerYear.toString());
          setFormattedValues(prev => ({
            ...prev,
            [field]: maxValue
          }));
          setFormData(prev => ({
            ...prev,
            [field]: maxCesantiasPerYear
          }));
          return;
        }
      }

      if (field === 'primaAmount' && formData.hasPrima && numValue > 0) {
        const maxPrimaPerYear = formData.projectValue / (formData.creditTerm * 2);
        if (numValue > maxPrimaPerYear) {
          setInputError(`La prima no puede exceder ${formatCurrency(maxPrimaPerYear)} por pago (2 veces al año)`);
          setTimeout(() => setInputError(''), 3000);
          const maxValue = formatNumber(maxPrimaPerYear.toString());
          setFormattedValues(prev => ({
            ...prev,
            [field]: maxValue
          }));
          setFormData(prev => ({
            ...prev,
            [field]: maxPrimaPerYear
          }));
          return;
        }
      }

      setFormData(prev => ({
        ...prev,
        [field]: numValue
      }));
      
      const formattedValue = formatNumber(value.toString());
      setFormattedValues(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
  };

  const handleCheckboxChange = (field, checked) => {
    const updatedData = {
      ...formData,
      [field]: checked
    };

    if (!checked) {
      if (field === 'hasSubsidy') {
        updatedData.subsidyAmount = 0;
        setFormattedValues(prev => ({
          ...prev,
          subsidyAmount: ''
        }));
      }
      if (field === 'hasCesantias') {
        updatedData.cesantiasAmount = 0;
        setFormattedValues(prev => ({
          ...prev,
          cesantiasAmount: ''
        }));
      }
      if (field === 'hasPrima') {
        updatedData.primaAmount = 0;
        setFormattedValues(prev => ({
          ...prev,
          primaAmount: ''
        }));
      }
    }

    const totalSum = updatedData.downPayment + updatedData.subsidyAmount;

    if (totalSum > updatedData.projectValue) {
      console.log('Suma total (checkbox):', totalSum, 'Valor proyecto:', updatedData.projectValue);
      showExcessAlert(totalSum, updatedData.projectValue);
    }

    setFormData(updatedData);
  };

  useEffect(() => {
    setFormattedValues({
      downPayment: formatNumber(formData.downPayment.toString()),
      subsidyAmount: formatNumber(formData.subsidyAmount.toString()),
      cesantiasAmount: formatNumber(formData.cesantiasAmount.toString()),
      primaAmount: formatNumber(formData.primaAmount.toString())
    });
  }, []);

  useEffect(() => {
    calculateFinancing();
  }, [calculateFinancing]);

  const getMaxCesantiasPerYear = () => {
    return formData.projectValue / formData.creditTerm;
  };

  const getMaxPrimaPerYear = () => {
    return formData.projectValue / (formData.creditTerm * 2);
  };

  return {
    formData,
    calculation,
    inputError,
    formattedValues,
    
    formatCurrency,
    getMaxCesantiasPerYear,
    getMaxPrimaPerYear,
    
    handleInputChange,
    handleCheckboxChange
  };
};
