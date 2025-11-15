import React, { useMemo, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useFirebaseFavorites } from '../../../hooks/useFirebaseFavorites';
import { useFirebaseSimulations } from '../../../hooks/useFirebaseSimulations';
import { useFeaturedProjects } from '../../../hooks/useFirebaseProjects';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const DashboardPage = () => {
  const { favorites } = useFirebaseFavorites();
  const { simulations } = useFirebaseSimulations();
  const { projects: featuredProjects } = useFeaturedProjects(6);
  const { isAuthenticated, user } = useAuth();
  const [selectedPaymentView, setSelectedPaymentView] = useState('mensual');

  const aggregated = useMemo(() => {
    if (!simulations.length) {
      return {
        timeline: [],
        totalSubsidy: 0,
        avgMonthlyPayment: 0,
        projectsWithSimulation: 0,
      };
    }

    const sorted = [...simulations].sort(
      (a, b) => new Date(a.updatedAt ?? a.createdAt).getTime() - new Date(b.updatedAt ?? b.createdAt).getTime(),
    );

    const timeline = sorted.map((simulation, index) => ({
      index,
      label: simulation.projectName ?? `Proyecto ${index + 1}`,
      monthlyPayment: Math.round(simulation.calculation?.monthlyPayment ?? 0),
    }));

    const totalSubsidy = sorted.reduce((acc, item) => acc + (item.subsidyAmount ?? 0), 0);
    const avgMonthlyPayment =
      sorted.reduce((acc, item) => acc + (item.calculation?.monthlyPayment ?? 0), 0) / sorted.length;

    return {
      timeline,
      totalSubsidy,
      avgMonthlyPayment,
      projectsWithSimulation: new Set(sorted.map((item) => item.projectId)).size,
    };
  }, [simulations]);


  const statusDistribution = useMemo(() => {
    const projects = featuredProjects || [];
    const counts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1;
      return acc;
    }, {});
    const total = Object.values(counts).reduce((acc, value) => acc + value, 0);

    return Object.entries(counts).map(([status, value]) => ({
      status,
      value,
      percentage: total ? Math.round((value / total) * 100) : 0,
    }));
  }, [featuredProjects]);

  const statusChartData = useMemo(() => {
    return [
      ['Estado', 'Total'],
      ...statusDistribution.map((item) => [item.status, item.value]),
    ];
  }, [statusDistribution]);

  const statusChartOptions = useMemo(
    () => ({
      backgroundColor: 'transparent',
      chartArea: { width: '90%', height: '80%' },
      legend: {
        position: 'bottom',
        textStyle: { color: '#475569', fontSize: 12 },
        alignment: 'center',
      },
      pieHole: 0.65,
      pieSliceText: 'none',
      slices: {
        0: { color: '#38bdf8' },
        1: { color: '#f97316' },
        2: { color: '#22c55e' },
        3: { color: '#a855f7' },
        4: { color: '#facc15' },
      },
      tooltip: { textStyle: { color: '#0f172a', fontSize: 12 } },
    }),
    [],
  );

  const paymentInsights = useMemo(() => {
    if (!simulations.length) {
      // Si no hay simulaciones, retornar estructura vacía
      return {
        monthlyData: [],
        monthlyAverage: 0,
        monthlyVariation: 0,
        maxMonthly: 0,
        annualData: [],
        totalPrincipal: 0,
        totalInterest: 0,
      };
    }

    const monthlyMap = new Map();
    const annualMap = new Map();

    simulations.forEach((simulation) => {
      const dateValue = simulation.updatedAt ?? simulation.createdAt;
      const baseDate = dateValue ? new Date(dateValue) : null;
      if (!baseDate || Number.isNaN(baseDate.getTime())) {
        return;
      }

      const monthKey = `${baseDate.getFullYear()}-${baseDate.getMonth()}`;
      const label = `${baseDate
        .toLocaleDateString('es-CO', { month: 'short' })
        .replace('.', '')
        .replace(/^\w/, (c) => c.toUpperCase())} ${String(baseDate.getFullYear()).slice(2)}`;
      const monthlyPayment = Math.round(simulation.calculation?.monthlyPayment ?? 0);

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          timestamp: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).getTime(),
          label,
          sum: 0,
          count: 0,
        });
      }

      const monthlyEntry = monthlyMap.get(monthKey);
      monthlyEntry.sum += monthlyPayment;
      monthlyEntry.count += 1;
      monthlyMap.set(monthKey, monthlyEntry);

      const yearKey = baseDate.getFullYear().toString();
      if (!annualMap.has(yearKey)) {
        annualMap.set(yearKey, {
          year: yearKey,
          principal: 0,
          interest: 0,
        });
      }

      const annualEntry = annualMap.get(yearKey);
      const creditAmount = Math.max(simulation.calculation?.creditAmount ?? 0, 0);
      const totalInterest = Math.max(simulation.calculation?.totalInterest ?? 0, 0);
      annualEntry.principal += creditAmount;
      annualEntry.interest += totalInterest;
      annualMap.set(yearKey, annualEntry);
    });

    const monthlyData = Array.from(monthlyMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => ({
        label: item.label,
        value: Math.round(item.sum / Math.max(item.count, 1)),
      }));

    const maxMonthly = monthlyData.reduce((acc, item) => Math.max(acc, item.value), 0);
    const monthlyAverage = monthlyData.length
      ? monthlyData.reduce((acc, item) => acc + item.value, 0) / monthlyData.length
      : 0;
    const monthlyVariation =
      monthlyData.length > 1 && monthlyData[0].value
        ? ((monthlyData.at(-1).value - monthlyData[0].value) / monthlyData[0].value) * 100
        : 0;

    const annualData = Array.from(annualMap.values())
      .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10))
      .map((item) => ({
        year: item.year,
        principal: Math.round(item.principal),
        interest: Math.round(item.interest),
      }));

    const totalPrincipal = annualData.reduce((acc, item) => acc + item.principal, 0);
    const totalInterest = annualData.reduce((acc, item) => acc + item.interest, 0);

    return {
      monthlyData: monthlyData.length ? monthlyData : [],
      monthlyAverage: monthlyData.length ? monthlyAverage : 0,
      monthlyVariation: monthlyData.length ? monthlyVariation : 0,
      maxMonthly: monthlyData.length ? maxMonthly : 0,
      annualData: annualData.length ? annualData : [],
      totalPrincipal: annualData.length ? totalPrincipal : 0,
      totalInterest: annualData.length ? totalInterest : 0,
    };
  }, [simulations]);

  const timelineChartData = useMemo(() => {
    if (selectedPaymentView === 'mensual') {
      return [
        ['Periodo', 'Cuota promedio', { role: 'style' }],
        ...paymentInsights.monthlyData.map((item) => [
          item.label,
          item.value,
          'color: #2563eb; opacity: 0.85',
        ]),
      ];
    }

    return [
      ['Año', 'Capital', 'Intereses'],
      ...paymentInsights.annualData.map((item) => [item.year, item.principal, item.interest]),
    ];
  }, [paymentInsights, selectedPaymentView]);

  const timelineChartOptions = useMemo(() => {
    if (selectedPaymentView === 'mensual') {
      return {
        backgroundColor: 'transparent',
        legend: { position: 'none' },
        chartArea: { width: '85%', height: '70%' },
        bar: { groupWidth: '55%' },
        vAxis: {
          format: 'currency',
          textStyle: { color: '#475569', fontSize: 11 },
          gridlines: { color: '#e2e8f0' },
          baselineColor: '#e2e8f0',
        },
        hAxis: {
          textStyle: { color: '#475569', fontSize: 11 },
          slantedText: true,
          slantedTextAngle: 25,
        },
        tooltip: { textStyle: { color: '#0f172a', fontSize: 12 } },
      };
    }

    return {
      backgroundColor: 'transparent',
      legend: { position: 'bottom', textStyle: { color: '#475569', fontSize: 12 } },
      chartArea: { width: '85%', height: '70%' },
      isStacked: true,
      colors: ['#2563eb', '#f97316'],
      hAxis: {
        textStyle: { color: '#475569', fontSize: 11 },
        gridlines: { color: '#e2e8f0' },
        baselineColor: '#e2e8f0',
      },
      vAxis: {
        format: 'currency',
        textStyle: { color: '#475569', fontSize: 11 },
        gridlines: { color: '#e2e8f0' },
        baselineColor: '#e2e8f0',
      },
      tooltip: { textStyle: { color: '#0f172a', fontSize: 12 } },
      areaOpacity: 0.8,
    };
  }, [selectedPaymentView]);

  const timelineChartType = selectedPaymentView === 'mensual' ? 'ColumnChart' : 'AreaChart';

  const annualDistribution =
    paymentInsights.totalPrincipal + paymentInsights.totalInterest > 0
      ? {
          capital: Math.round(
            (paymentInsights.totalPrincipal / (paymentInsights.totalPrincipal + paymentInsights.totalInterest)) * 100,
          ),
          interest: Math.round(
            (paymentInsights.totalInterest / (paymentInsights.totalPrincipal + paymentInsights.totalInterest)) * 100,
          ),
        }
      : { capital: 0, interest: 0 };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-b from-white via-slate-50 to-white py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 text-center sm:px-6 lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Dashboard SmartHousing
            </span>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              Centraliza tus simulaciones y pagos en un solo lugar
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Visualiza la evolución de tus cuotas, compara proyectos y guarda simulaciones personalizadas. Inicia sesión
              para acceder a la experiencia completa o crea una cuenta en segundos.
            </p>
          </div>

          <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Simulaciones guardadas',
                description: 'Almacena diferentes escenarios de crédito y compáralos fácilmente.',
              },
              {
                title: 'Seguimiento de pagos',
                description: 'Controla cuotas planificadas frente a las realizadas y evita retrasos.',
              },
              {
                title: 'Proyectos favoritos',
                description: 'Marca tus proyectos preferidos y accede rápidamente a sus detalles.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-600"
            >
              Iniciar sesión
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 4H9m12-4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
            >
              Crear cuenta
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-100 via-transparent to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-20">
          <header className="mb-10 flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Panel analítico
            </span>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">Dashboard financiero personal</h1>
            <p className="max-w-3xl text-base text-slate-600 sm:text-lg">
              Visualiza tus simulaciones, identifica oportunidades de ahorro y haz seguimiento al avance de tus proyectos favoritos con gráficos dinámicos en un entorno luminoso.
            </p>
          </header>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Simulaciones registradas',
                value: simulations.length,
                tone: 'from-sky-100 to-blue-100 text-blue-700',
                detail: `${aggregated.projectsWithSimulation} proyectos únicos`,
              },
              {
                label: 'Promedio cuota mensual',
                value: timelineChartData.length > 1
                  ? formatCurrency(Math.round(paymentInsights.monthlyAverage || 0))
                  : simulations.length
                    ? formatCurrency(Math.round(aggregated.avgMonthlyPayment))
                    : '—',
                tone: 'from-emerald-100 to-teal-100 text-emerald-700',
                detail: simulations.length ? 'Basado en simulaciones guardadas' : 'Añade simulaciones para ver datos',
              },
              {
                label: 'Subsidio total proyectado',
                value: simulations.length ? formatCurrency(aggregated.totalSubsidy) : '—',
                tone: 'from-amber-100 to-orange-100 text-amber-700',
                detail: simulations.length ? 'Ahorro acumulado estimado' : 'Aplica subsidios en tus simulaciones',
              },
              {
                label: 'Proyectos favoritos',
                value: favorites.length,
                tone: 'from-purple-100 to-indigo-100 text-purple-700',
                detail: favorites.length ? 'Gestiona tus proyectos preferidos' : 'Marca proyectos en el catálogo',
              },
            ].map((metric) => (
              <article
                key={metric.label}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className={`inline-flex rounded-full bg-gradient-to-r ${metric.tone} px-3 py-1 text-[10px] font-semibold uppercase tracking-widest`}>
                  Indicador
                </div>
                <p className="mt-6 text-sm text-slate-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{metric.value}</p>
                <p className="mt-4 text-xs text-slate-500">{metric.detail}</p>
              </article>
            ))}
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <figure className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <figcaption className="text-sm font-semibold text-blue-600">Seguimiento de simulaciones</figcaption>
                  <h2 className="text-2xl font-semibold text-slate-900">Evolución de cuota mensual</h2>
                </div>
                <div className="flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-500">
                  {['mensual', 'anual'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`rounded-full px-3 py-1 transition ${
                        selectedPaymentView === tab ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-700'
                      }`}
                      onClick={() => setSelectedPaymentView(tab)}
                    >
                      {tab === 'mensual' ? 'Mensual' : 'Anual'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 h-64 w-full">
                {timelineChartData.length > 1 ? (
                  <Chart
                    chartType={timelineChartType}
                    width="100%"
                    height="100%"
                    data={timelineChartData}
                    options={timelineChartOptions}
                    loader={<div className="text-sm text-slate-500">Cargando gráfico…</div>}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
                    Registra una simulación para visualizar la evolución de tus cuotas mensuales.
                  </div>
                )}
              </div>

              <dl className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                {selectedPaymentView === 'mensual' ? (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Promedio mensual</dt>
                      <dd className="mt-2 text-xl font-semibold text-slate-900">
                        {timelineChartData.length > 1
                          ? formatCurrency(Math.round(paymentInsights.monthlyAverage || 0))
                          : '—'}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Variación reciente</dt>
                      <dd className="mt-2 flex items-baseline gap-2 text-xl font-semibold text-slate-900">
                        {timelineChartData.length > 1 && Number.isFinite(paymentInsights.monthlyVariation)
                          ? `${paymentInsights.monthlyVariation >= 0 ? '+' : ''}${paymentInsights.monthlyVariation.toFixed(
                              1,
                            )}%`
                          : '—'}
                        {timelineChartData.length > 1 && (
                          <span className="text-xs font-medium text-slate-500">vs primer periodo registrado</span>
                        )}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Cuota máxima proyectada</dt>
                      <dd className="mt-2 text-xl font-semibold text-slate-900">
                        {timelineChartData.length > 1 ? formatCurrency(Math.round(paymentInsights.maxMonthly)) : '—'}
                      </dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Capital acumulado</dt>
                      <dd className="mt-2 text-xl font-semibold text-slate-900">
                        {timelineChartData.length > 1
                          ? formatCurrency(Math.round(paymentInsights.totalPrincipal || 0))
                          : '—'}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Intereses proyectados</dt>
                      <dd className="mt-2 text-xl font-semibold text-slate-900">
                        {timelineChartData.length > 1
                          ? formatCurrency(Math.round(paymentInsights.totalInterest || 0))
                          : '—'}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Relación capital / intereses</dt>
                      <dd className="mt-2 text-xl font-semibold text-slate-900">
                        {timelineChartData.length > 1
                          ? `${annualDistribution.capital}% / ${annualDistribution.interest}%`
                          : '—'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </figure>

            <figure className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div>
                <figcaption className="text-sm font-semibold text-blue-600">Catálogo SmartHousing</figcaption>
                <h2 className="text-2xl font-semibold text-slate-900">Estado de proyectos destacados</h2>
              </div>

              <div className="relative mx-auto h-64 w-full max-w-xl">
                {statusDistribution.length ? (
                  <Chart
                    chartType="PieChart"
                    width="100%"
                    height="100%"
                    data={statusChartData}
                    options={statusChartOptions}
                    loader={<div className="text-sm text-slate-500">Cargando gráfico…</div>}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
                    Aún no hay proyectos destacados para graficar.
                  </div>
                )}
                <div className="pointer-events-none absolute inset-6 rounded-full border border-slate-100" />
              </div>

              <ul className="grid gap-2 text-sm text-slate-700">
                {statusDistribution.map((item, index) => {
                  const colors = [
                    { bg: '#bae6fd', dot: '#0284c7' },
                    { bg: '#fde68a', dot: '#b45309' },
                    { bg: '#bbf7d0', dot: '#047857' },
                    { bg: '#ddd6fe', dot: '#6d28d9' },
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <li key={item.status} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-2.5 rounded-full" style={{ backgroundColor: color.dot }} />
                        <span className="font-medium text-slate-900">{item.status}</span>
                      </div>
                      <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ backgroundColor: color.bg, color: color.dot }}>
                        {item.percentage}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </figure>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Simulaciones recientes</h2>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {simulations.length ? 'Actualizado' : 'Sin registros'}
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Proyecto</th>
                      <th className="px-4 py-3 text-left">Cuota mensual</th>
                      <th className="px-4 py-3 text-left">Aporte inicial</th>
                      <th className="px-4 py-3 text-left">Última actualización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {simulations.slice(-5).reverse().map((simulation) => (
                      <tr key={simulation.id ?? simulation.projectId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{simulation.projectName ?? 'Proyecto sin nombre'}</td>
                        <td className="px-4 py-3 text-slate-700">{formatCurrency(simulation.calculation?.monthlyPayment ?? 0)}</td>
                        <td className="px-4 py-3 text-slate-700">{formatCurrency(simulation.downPayment ?? 0)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {simulation.updatedAt
                            ? new Date(simulation.updatedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                    {!simulations.length && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                          No tienes simulaciones guardadas. Realiza una nueva simulación para comenzar el seguimiento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Acciones recomendadas</h3>
                <ul className="mt-4 space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="mt-1 inline-flex size-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="font-medium text-slate-900">Actualiza tus simulaciones con nuevas tasas</p>
                      <p className="text-xs text-slate-500">Compara escenarios con un incremento del 2% en la tasa de interés para anticipar cambios.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="mt-1 inline-flex size-2 rounded-full bg-amber-400" />
                    <div>
                      <p className="font-medium text-slate-900">Revisa tus favoritos</p>
                      <p className="text-xs text-slate-500">Marca al menos tres proyectos con estados distintos para visibilizar su impacto en el portafolio.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="mt-1 inline-flex size-2 rounded-full bg-sky-400" />
                    <div>
                      <p className="font-medium text-slate-900">Guarda una nueva simulación</p>
                      <p className="text-xs text-slate-500">Al menos una simulación con subsidio y otra sin subsidio permite comparar cuotas y plazos.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Próximos pasos</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Descarga tu reporte personalizado o comparte tu simulación con un asesor. Mantén tus datos actualizados para
                  obtener recomendaciones más precisas.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                  >
                    Descargar reporte
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Compartir con asesor
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zM12 14c-4 0-8 2-8 6h16c0-4-4-6-8-6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

