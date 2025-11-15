export const calculateEstimatedPayments = (simulation, project = null) => {
  if (!simulation?.calculation) {
    return [];
  }

  const monthlyPayment = simulation.calculation.monthlyPayment || 0;
  const creditTerm = simulation.creditTerm || 20;

  const startDate = simulation.createdAt 
    ? new Date(simulation.createdAt) 
    : new Date();
  
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const simulationStartDate = new Date(startYear, startMonth, 1);
  
  let endDate;
  if (project?.deliveryDate) {
    endDate = new Date(project.deliveryDate);
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    endDate = new Date(endYear, endMonth, 1);
  } else {
    const endYear = simulationStartDate.getFullYear() + creditTerm;
    const endMonth = simulationStartDate.getMonth();
    endDate = new Date(endYear, endMonth, 1);
  }
  
  if (endDate <= simulationStartDate) {
    return calculatePaymentsFromToday(monthlyPayment, creditTerm);
  }
  
  const monthsDiff = (endDate.getFullYear() - simulationStartDate.getFullYear()) * 12 
    + (endDate.getMonth() - simulationStartDate.getMonth());
  
  const maxMonths = creditTerm * 12;
  const totalMonths = Math.min(monthsDiff, maxMonths);
  
  return generatePaymentPeriods(simulationStartDate, totalMonths, monthlyPayment);
};

const calculatePaymentsFromToday = (monthlyPayment, creditTerm) => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const newStartDate = new Date(todayYear, todayMonth, 1);
  const endDate = new Date(todayYear + creditTerm, todayMonth, 1);
  
  const monthsDiff = (endDate.getFullYear() - newStartDate.getFullYear()) * 12 
    + (endDate.getMonth() - newStartDate.getMonth());
  
  return generatePaymentPeriods(newStartDate, monthsDiff, monthlyPayment, creditTerm * 12);
};

const generatePaymentPeriods = (startDate, totalMonths, monthlyPayment, maxMonths = null) => {
  const periods = [];
  const fixedPayment = Math.round(monthlyPayment);
  const limit = maxMonths ? Math.min(totalMonths, maxMonths) : totalMonths;
  
  for (let i = 0; i <= limit; i++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const monthLabel = date.toLocaleDateString('es-CO', { month: 'short' });
    const year = date.getFullYear();
    
    periods.push({
      label: monthLabel,
      year: year,
      required: fixedPayment,
      actual: fixedPayment,
    });
  }
  
  return periods;
};

