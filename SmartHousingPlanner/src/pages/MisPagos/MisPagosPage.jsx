import React, { useState } from 'react';
import PaymentCharts from '../Home/PaymentCharts';

const MisPagosPage = () => {
  const [activeProject, setActiveProject] = useState(null);

  const userProjects = [
    {
      id: 1,
      name: "Torres del Sol",
      location: "Bogotá, Colombia",
      price: 280000000,
      downPayment: 84000000,
      creditAmount: 196000000,
      monthlyPayment: 2500000,
      remainingMonths: 240,
      subsidy: 15000000,
      status: "En proceso"
    },
    {
      id: 2,
      name: "Residencial Los Robles",
      location: "Medellín, Colombia",
      price: 320000000,
      downPayment: 96000000,
      creditAmount: 224000000,
      monthlyPayment: 3200000,
      remainingMonths: 220,
      subsidy: 20000000,
      status: "Aprobado"
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mis Pagos</h1>
          <p className="text-lg text-gray-600">
            Gestiona y visualiza el estado de tus pagos hipotecarios
          </p>
        </div>

        {/* Proyectos del Usuario */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Proyectos</h2>
            <div className="space-y-6">
              {userProjects.map((project) => (
                <div 
                  key={project.id}
                  className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 cursor-pointer ${
                    activeProject?.id === project.id 
                      ? 'border-blue-500 shadow-xl' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => setActiveProject(project)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                      <p className="text-gray-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {project.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'Aprobado' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Precio Total</div>
                      <div className="font-semibold text-gray-900">{formatCurrency(project.price)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Cuota Mensual</div>
                      <div className="font-semibold text-blue-600">{formatCurrency(project.monthlyPayment)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {project.remainingMonths} meses restantes
                    </span>
                    <span className="text-green-600 font-medium">
                      Subsidio: {formatCurrency(project.subsidy)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen Financiero</h3>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(420000000)}
                  </div>
                  <div className="text-sm text-gray-500">Valor Total Proyectos</div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Pagado</span>
                    <span className="font-semibold">{formatCurrency(120000000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto Pendiente</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(300000000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subsidios Aprobados</span>
                    <span className="font-semibold text-green-600">{formatCurrency(35000000)}</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 mb-1">Próximo Pago</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(activeProject?.monthlyPayment || 2500000)}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {activeProject?.name || 'Torres del Sol'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos de Pagos */}
        {activeProject && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Simulación: {activeProject.name}
              </h3>
              <p className="text-gray-600">
                Visualiza cómo se distribuyen tus pagos para este proyecto específico
              </p>
            </div>
            <PaymentCharts />
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPagosPage;
