const pickNumber = (...values) => {
  for (const value of values) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && value !== undefined && value !== null) {
      return parsed;
    }
  }
  return 0;
};

export const buildSimulationSummary = (simulationDetails) => {
  if (!simulationDetails) {
    return null;
  }

  const calculation = simulationDetails.calculation || {};
  const availableResources =
    pickNumber(simulationDetails.totalAvailable, calculation.totalAvailable, 0) ||
    [
      simulationDetails.cesantiasAmount,
      simulationDetails.primaAmount,
      simulationDetails.savingsAmount,
      calculation.cesantiasAmount,
      calculation.primaAmount,
      calculation.savingsAmount,
    ].reduce((sum, value) => sum + (Number(value) || 0), 0);

  return {
    projectValue: pickNumber(simulationDetails.projectValue, calculation.projectValue),
    financedAmount: pickNumber(simulationDetails.creditAmount, calculation.creditAmount, calculation.loanAmount),
    downPaymentRequired: pickNumber(
      simulationDetails.requiredDownPayment,
      calculation.requiredDownPayment,
      simulationDetails.downPayment,
    ),
    availableResources,
    subsidy: pickNumber(simulationDetails.subsidyAmount, calculation.subsidyAmount),
    prima: pickNumber(simulationDetails.primaAmount, calculation.primaAmount),
    totalInterests: pickNumber(
      simulationDetails.totalInterests,
      calculation.totalInterest,
      simulationDetails.totalInterest,
    ),
    totalToPay: pickNumber(simulationDetails.totalToPay, calculation.totalPayments, simulationDetails.totalPayments),
    monthlyPayment: pickNumber(
      calculation.monthlyPayment,
      simulationDetails.monthlyPayment,
      calculation.paymentPerMonth,
    ),
    createdAt: simulationDetails.createdAt || simulationDetails.created_at || null,
  };
};

export const calculatePaymentStats = ({
  summary,
  simulationDetails,
  paymentHistory = [],
  fallbackMonthlyPayment = 0,
  fallbackRemainingMonths,
}) => {
  const monthlyRequired = summary?.monthlyPayment
    ? Math.round(summary.monthlyPayment)
    : Math.round(Number(fallbackMonthlyPayment) || 0);

  const totalPaid = paymentHistory.reduce(
    (sum, entry) => sum + (Number(entry.actual ?? entry.amount ?? entry.value ?? 0) || 0),
    0,
  );

  const monthsFromSimulation =
    Number(simulationDetails?.calculation?.totalMonths) ||
    (simulationDetails?.creditTerm ? Number(simulationDetails.creditTerm) * 12 : null);

  const totalExpected =
    summary?.totalToPay ??
    (monthlyRequired || 0) *
      (monthsFromSimulation || fallbackRemainingMonths || paymentHistory.length || 0);

  const remainingBalance = Math.max(Number(totalExpected || 0) - totalPaid, 0);

  return {
    monthlyRequired,
    totalPaid,
    totalExpected,
    remainingBalance,
  };
};

