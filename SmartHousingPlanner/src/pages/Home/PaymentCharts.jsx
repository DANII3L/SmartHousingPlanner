import React, { useState } from 'react';

const PaymentCharts = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('anual');

  const sampleData = {
    mensual: [
      { month: 'Ene', amount: 2500000 },
      { month: 'Feb', amount: 2500000 },
      { month: 'Mar', amount: 2500000 },
      { month: 'Abr', amount: 2500000 },
      { month: 'May', amount: 2500000 },
      { month: 'Jun', amount: 2500000 },
    ],
    anual: [
      { year: '2024', principal: 25000000, interest: 8000000 },
      { year: '2025', principal: 30000000, interest: 7500000 },
      { year: '2026', principal: 35000000, interest: 7000000 },
      { year: '2027', principal: 40000000, interest: 6500000 },
      { year: '2028', principal: 45000000, interest: 6000000 },
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyData = sampleData.mensual;
  const maxMonthlyAmount = Math.max(...monthlyData.map(item => item.amount));

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-block text-blue-500 font-semibold text-sm tracking-wider uppercase mb-4">
            SIMULACIÓN DE PAGOS
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            Gráficos interactivos de tus pagos
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Visualiza cómo se distribuyen tus pagos mensuales, el progreso de tu deuda y 
            cómo los subsidios afectan tu plan de financiamiento.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Pagos Mensuales</h3>
                <div className="flex bg-white rounded-lg p-1">
                  <button
                    onClick={() => setSelectedTimeframe('mensual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      selectedTimeframe === 'mensual'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setSelectedTimeframe('anual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      selectedTimeframe === 'anual'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Anual
                  </button>
                </div>
              </div>

              {selectedTimeframe === 'mensual' ? (
                <div className="space-y-4">
                  {monthlyData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 text-sm font-medium text-gray-600">{item.month}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${(item.amount / maxMonthlyAmount) * 100}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-end pr-3">
                          <span className="text-xs font-medium text-gray-700">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {sampleData.anual.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{item.year}</h4>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Pago Anual</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(item.principal + item.interest)}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Capital</span>
                          <span className="text-sm font-medium text-blue-600">
                            {formatCurrency(item.principal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Intereses</span>
                          <span className="text-sm font-medium text-orange-500">
                            {formatCurrency(item.interest)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cuota Mensual</div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(2500000)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ahorro con Subsidio</div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(15000000)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Progreso del Crédito</h3>
              
              <div className="relative mb-8">
                <svg className="w-full h-64" viewBox="0 0 300 200">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background circle */}
                  <circle
                    cx="150"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                  />
                  
                  {/* Progress circle */}
                  <circle
                    cx="150"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 80 * 0.25} ${2 * Math.PI * 80}`}
                    strokeDashoffset={2 * Math.PI * 80 * 0.25}
                    transform="rotate(-90 150 100)"
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* Center text */}
                  <text x="150" y="95" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
                    25%
                  </text>
                  <text x="150" y="115" textAnchor="middle" className="text-sm fill-gray-600">
                    Pagado
                  </text>
                </svg>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Total</span>
                  <span className="font-semibold">{formatCurrency(300000000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pagado</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(75000000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saldo Pendiente</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(225000000)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Consejo Inteligente</h4>
                  <p className="text-gray-700 text-sm">
                    Con el subsidio Mi Casa Ya puedes reducir tu cuota mensual en hasta 30%. 
                    Nuestros gráficos se actualizan automáticamente con tus beneficios disponibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <button className="inline-flex items-center px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
            <span>Personalizar Mi Simulación</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PaymentCharts;
