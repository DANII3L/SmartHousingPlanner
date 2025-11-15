const SimulationDetailPanel = ({
  isLoading,
  error,
  summary,
  monthlyRequired,
  formatCurrency,
}) => {
  if (isLoading) {
    return <p className="text-gray-600">Cargando información de la simulación...</p>;
  }

  if (error) {
    return <p className="text-rose-600">{error}</p>;
  }

  if (!summary) {
    return (
      <p className="text-gray-600">
        Aún no hay una simulación registrada para este proyecto. Solicita a un asesor que la cree para ver los valores
        exactos.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Simulación vigente</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{formatCurrency(monthlyRequired)}</p>
          <p className="text-xs text-slate-500">Cuota mensual estimada</p>
        </div>

        <div className="grid gap-3 text-sm text-slate-600">
          <p className="flex items-center justify-between">
            <span>Valor total</span>
            <strong className="text-slate-900">{formatCurrency(summary.projectValue)}</strong>
          </p>
          <p className="flex items-center justify-between">
            <span>Monto a financiar</span>
            <strong className="text-slate-900">{formatCurrency(summary.financedAmount)}</strong>
          </p>
          <p className="flex items-center justify-between">
            <span>Cuota inicial requerida (30%)</span>
            <strong className="text-slate-900">{formatCurrency(summary.downPaymentRequired)}</strong>
          </p>
          <p className="flex items-center justify-between">
            <span>Recursos disponibles</span>
            <strong className="text-emerald-600">{formatCurrency(summary.availableResources)}</strong>
          </p>
          <p className="flex items-center justify-between">
            <span>Subsidio</span>
            <strong className="text-emerald-600">{formatCurrency(summary.subsidy)}</strong>
          </p>
          <p className="flex items-center justify-between">
            <span>Prima (junio y diciembre)</span>
            <strong className="text-emerald-600">{formatCurrency(summary.prima)}</strong>
          </p>
        </div>

        {summary.createdAt && (
          <p className="text-xs text-slate-400">
            Creada:{' '}
            {new Date(summary.createdAt).toLocaleDateString('es-CO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default SimulationDetailPanel;

