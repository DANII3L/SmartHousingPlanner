import React, { useMemo, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useNavigate } from 'react-router-dom';

const PaymentCharts = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('anual');

  const navigate = useNavigate();

  const sampleData = useMemo(
    () => ({
      mensual: [
        { month: 'Ene', amount: 2450000 },
        { month: 'Feb', amount: 2480000 },
        { month: 'Mar', amount: 2520000 },
        { month: 'Abr', amount: 2520000 },
        { month: 'May', amount: 2550000 },
        { month: 'Jun', amount: 2580000 },
      ],
      anual: [
        { year: '2024', principal: 25000000, interest: 7800000 },
        { year: '2025', principal: 29500000, interest: 7200000 },
        { year: '2026', principal: 34000000, interest: 6600000 },
        { year: '2027', principal: 38200000, interest: 6100000 },
        { year: '2028', principal: 41500000, interest: 5600000 },
      ],
    }),
    [],
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const totalPrincipal = sampleData.anual.reduce((acc, item) => acc + item.principal, 0);
  const totalInterest = sampleData.anual.reduce((acc, item) => acc + item.interest, 0);

  const monthlyChartData = useMemo(
    () => [
      ['Mes', 'Cuota estimada', { role: 'style' }],
      ...sampleData.mensual.map((item) => [
        item.month,
        item.amount,
        'color: #2563eb; opacity: 0.85',
      ]),
    ],
    [sampleData.mensual],
  );

  const monthlyChartOptions = useMemo(
    () => ({
      backgroundColor: 'transparent',
      legend: { position: 'none' },
      chartArea: { width: '85%', height: '70%' },
      vAxis: {
        format: 'currency',
        textStyle: { color: '#475569', fontSize: 12 },
        gridlines: { color: '#e2e8f0' },
        baselineColor: '#e2e8f0',
      },
      hAxis: {
        textStyle: { color: '#475569', fontSize: 12 },
      },
      bar: { groupWidth: '55%' },
      tooltip: { textStyle: { color: '#1f2937', fontSize: 12 } },
    }),
    [],
  );

  const annualChartData = useMemo(
    () => [
      ['Año', 'Capital', 'Intereses'],
      ...sampleData.anual.map((item) => [item.year, item.principal, item.interest]),
    ],
    [sampleData.anual],
  );

  const annualChartOptions = useMemo(
    () => ({
      backgroundColor: 'transparent',
      legend: {
        position: 'bottom',
        textStyle: { color: '#475569', fontSize: 12 },
      },
      chartArea: { width: '85%', height: '70%' },
      isStacked: true,
      colors: ['#2563eb', '#f97316'],
      hAxis: {
        textStyle: { color: '#475569', fontSize: 12 },
        gridlines: { color: '#e2e8f0' },
        baselineColor: '#e2e8f0',
      },
      vAxis: {
        format: 'currency',
        textStyle: { color: '#475569', fontSize: 12 },
        gridlines: { color: '#e2e8f0' },
        baselineColor: '#e2e8f0',
      },
      tooltip: { textStyle: { color: '#1f2937', fontSize: 12 } },
      areaOpacity: 0.85,
    }),
    [],
  );

  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Simulación de pagos
          </div>
          <h2 className="mt-6 text-4xl font-semibold text-gray-900 sm:text-5xl">Visualiza tus pagos con claridad</h2>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            Analiza la proyección de tus pagos mensuales y anuales, identificando el impacto del subsidio y la proporción entre capital e intereses.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <figure className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm shadow-slate-900/5">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <figcaption className="text-sm font-medium text-blue-600">Distribución de pagos</figcaption>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-900">Comparativa mensual / anual</h3>
                </div>
                <div className="flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-500">
                  {['mensual', 'anual'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSelectedTimeframe(tab)}
                      className={`rounded-full px-3 py-1 transition ${
                        selectedTimeframe === tab ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-700'
                      }`}
                    >
                      {tab === 'mensual' ? 'Mensual' : 'Anual'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-10">
                {selectedTimeframe === 'mensual' ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50 via-white to-white p-6">
                      <Chart
                        chartType="ColumnChart"
                        width="100%"
                        height="300px"
                        data={monthlyChartData}
                        options={monthlyChartOptions}
                        loader={<div className="text-sm text-slate-500">Cargando gráfico…</div>}
                      />
                    </div>
                    <dl className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                        <dt className="text-xs uppercase tracking-wide text-slate-500">Promedio mensual</dt>
                        <dd className="mt-2 text-2xl font-semibold text-slate-900">
                          {formatCurrency(
                            Math.round(
                              sampleData.mensual.reduce((acc, item) => acc + item.amount, 0) / sampleData.mensual.length,
                            ),
                          )}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                        <dt className="text-xs uppercase tracking-wide text-slate-500">Variación semestral</dt>
                        <dd className="mt-2 flex items-baseline gap-2 text-2xl font-semibold text-emerald-600">
                          +5.3%
                          <span className="text-xs font-medium text-emerald-500">vs periodo anterior</span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-grid-slate-100/[0.6] p-6">
                      <Chart
                        chartType="AreaChart"
                        width="100%"
                        height="320px"
                        data={annualChartData}
                        options={annualChartOptions}
                        loader={<div className="text-sm text-slate-500">Cargando gráfico…</div>}
                      />
                    </div>
                    <dl className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                        <dt className="text-xs uppercase tracking-wide text-slate-500">Capital acumulado</dt>
                        <dd className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalPrincipal)}</dd>
                        <dd className="mt-1 text-xs text-slate-500">70% del total proyectado</dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                        <dt className="text-xs uppercase tracking-wide text-slate-500">Intereses pagados</dt>
                        <dd className="mt-2 text-2xl font-semibold text-amber-600">{formatCurrency(totalInterest)}</dd>
                        <dd className="mt-1 text-xs text-slate-500">30% del total proyectado</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </figure>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="size-2 rounded-full bg-blue-500" />
                  Progreso de amortización
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(75000000)}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Pagado del total</p>
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-blue-500 to-sky-400 shadow" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Ahorro por subsidio
                </div>
                <p className="mt-4 text-3xl font-semibold text-emerald-600">{formatCurrency(15000000)}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Descuento aplicado</p>
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow" />
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="space-y-6">
                <header>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500/80">Resumen del plan</p>
                  <h3 className="mt-2 text-3xl font-semibold text-slate-900">Tu crédito en cifras</h3>
                </header>

                <div className="grid gap-4">
                  {[
                    { label: 'Valor del proyecto', value: formatCurrency(300000000), tone: 'text-slate-900' },
                    { label: 'Saldo pendiente', value: formatCurrency(225000000), tone: 'text-amber-500' },
                    { label: 'Tiempo restante', value: '18 años', tone: 'text-blue-600' },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
                      <p className={`mt-2 text-2xl font-semibold ${metric.tone}`}>{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-blue-50 p-5">
                  <h4 className="text-sm font-semibold text-blue-700">Recomendación</h4>
                  <p className="mt-2 text-sm text-blue-600">
                    Incrementar la cuota mensual en un 5% reduce el plazo en 22 meses y ahorra aproximadamente{' '}
                    {formatCurrency(11600000)} en intereses proyectados.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Simulaciones guardadas</h4>
              <p className="mt-2 text-base text-slate-600">
                Gestiona tus escenarios desde el dashboard personal para comparar diferentes proyectos o montos de cuota
                inicial.
              </p>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01]"
              >
                Abrir dashboard
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default PaymentCharts;

