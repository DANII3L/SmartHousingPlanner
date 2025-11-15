const FinancialSummaryPanel = ({
  projects,
  summary,
  totalPaid,
  totalExpected,
  remainingBalance,
  monthlyRequired,
  activeProject,
  formatCurrency,
}) => {
  const totalProjectsValue = projects.reduce((acc, project) => acc + (project.price || 0), 0);

  return (
    <div className="lg:col-span-1">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen Financiero</h3>
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(totalProjectsValue)}</div>
            <div className="text-sm text-gray-500">Valor Total Proyectos</div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total a pagar</span>
              <span className="font-semibold">{formatCurrency(summary?.totalToPay || totalExpected)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total pagado</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo pendiente</span>
              <span className="font-semibold text-blue-600">{formatCurrency(remainingBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total de intereses</span>
              <span className="font-semibold text-gray-900">{formatCurrency(summary?.totalInterests || 0)}</span>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 mb-1">Próximo Pago</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(monthlyRequired || activeProject?.monthlyPayment || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-2">{activeProject?.name || 'Torres del Sol'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryPanel;

