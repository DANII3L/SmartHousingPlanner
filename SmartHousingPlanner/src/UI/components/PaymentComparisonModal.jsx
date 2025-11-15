import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chart } from 'react-google-charts'

const PaymentComparisonModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  requiredLabel = 'Pago requerido',
  actualLabel = 'Pago realizado',
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const enhancedData = data.map((item) => {
    const diff = (item.actual ?? 0) - (item.required ?? 0)
    const status = diff > 0 ? 'above' : diff === 0 ? 'equal' : 'below'
    return {
      ...item,
      diff,
      status,
    }
  })

  const averageDiff = useMemo(() => {
    if (!enhancedData.length) {
      return 0
    }
    const total = enhancedData.reduce((acc, item) => acc + item.diff, 0)
    return Math.round(total / enhancedData.length)
  }, [enhancedData])

  const chartData = useMemo(() => {
    const rows = enhancedData.map((item) => {
      const label = item.year ? `${item.label} ${item.year}` : item.label
      return [label, item.required ?? 0, item.actual ?? 0]
    })

    return [['Periodo', requiredLabel, actualLabel], ...rows]
  }, [enhancedData, requiredLabel, actualLabel])

  const chartOptions = useMemo(
    () => ({
      chartArea: { width: '80%', height: '70%' },
      backgroundColor: 'transparent',
      legend: { position: 'bottom', textStyle: { color: '#475569', fontSize: 12 } },
      colors: ['#cbd5f5', '#2563eb'],
      hAxis: {
        title: requiredLabel,
        format: 'currency',
        textStyle: { color: '#475569', fontSize: 12 },
        baselineColor: '#e2e8f0',
        gridlines: { color: '#e2e8f0' },
      },
      vAxis: {
        title: 'Periodo',
        textStyle: { color: '#475569', fontSize: 12 },
      },
      tooltip: {
        textStyle: { color: '#1f2937', fontSize: 12 },
        showColorCode: true,
      },
    }),
    [requiredLabel],
  )

  const scrollContainerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) {
      return undefined
    }

    const updateDimensions = () => {
      setContainerWidth(el.clientWidth)
    }

    updateDimensions()

    const observer = new ResizeObserver(updateDimensions)
    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const chartPixelWidth = Math.max(chartData.length * 140, 1200);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      <div
        role="presentation"
        className="absolute inset-0 bg-slate-900/70 backdrop-blur"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[95vw] sm:max-w-[90vw] rounded-3xl border border-white/10 bg-white shadow-2xl shadow-slate-900/40 overflow-visible"
      >
        <div className="flex items-start justify-between px-6 py-6 sm:px-8 sm:py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500/80">
              Comparativa de pagos
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 px-6 pb-6 sm:grid-cols-[1.2fr_0.8fr] sm:px-8 sm:pb-8">
          <div
            ref={scrollContainerRef}
            className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <header className="mb-4">
              <p className="text-sm font-semibold text-slate-700">Rendimiento por período</p>
              <p className="text-xs text-slate-500">
                Compara pagos programados vs realizados por mes y año. Arrastra para desplazarte horizontalmente.
              </p>
            </header>
            <div className="max-w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-visible">
              <div
                className="inline-block max-w-[65vw] max-h-[70vh]"
              >
                <Chart
                  chartType="Bar"
                  data={chartData}
                  options={{
                    ...chartOptions,
                    chartArea: { width: "85%", height: "75%" },
                  }}
                  width={`${chartPixelWidth}px`}
                  height="520px"
                />
              </div>
            </div>
          </div>

          <aside className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Resumen del comportamiento</h3>
              <p className="mt-2 text-sm text-slate-500">
                Mantén tus pagos en línea con el valor requerido para evitar recargos. Usa esta comparativa para
                identificar oportunidades de ajuste.
              </p>
            </div>

            <dl className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Mayor pago registrado</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(Math.max(...enhancedData.map((item) => item.actual ?? 0), 0))}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Diferencia promedio</dt>
                <dd
                  className={`mt-1 text-lg font-semibold ${
                    averageDiff > 0 ? 'text-emerald-600' : averageDiff < 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {formatCurrency(averageDiff)}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Periodos en balance o superior</dt>
                <dd className="mt-1 text-lg font-semibold text-blue-600">
                  {
                    enhancedData.filter((item) => item.status === 'equal' || item.status === 'above')
                      .length
                  }{' '}
                  / {enhancedData.length}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  )
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export default PaymentComparisonModal

