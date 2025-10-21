import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentCharts from '../../Home/PaymentCharts';
import ProjectSimulator from '../../SimuladorProyecto/ProjectSimulator';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSimulator, setShowSimulator] = useState(false);

  const projects = {
    1: {
      name: "Torres del Sol",
      location: "Bogotá, Colombia",
      apartments: 120,
      priceFrom: 280000000,
      description: "Moderno proyecto residencial en el corazón de Bogotá, con excelente conectividad y servicios.",
      features: ["Zonas verdes", "Gimnasio", "Piscina", "Jardín infantil", "Seguridad 24/7"]
    },
    2: {
      name: "Residencial Los Robles",
      location: "Medellín, Colombia",
      apartments: 85,
      priceFrom: 320000000,
      description: "Lujoso desarrollo en Medellín con vista panorámica y acabados de primera calidad.",
      features: ["Terraza con vista", "Spa", "Cinema", "Club social", "Concierge"]
    },
    3: {
      name: "Vista Hermosa",
      location: "Cali, Colombia",
      apartments: 200,
      priceFrom: 250000000,
      description: "Gran proyecto familiar en Cali con espacios amplios y áreas de recreación.",
      features: ["Canchas deportivas", "Parque", "Salón comunal", "Estacionamiento", "Bodegas"]
    }
  };

  const project = projects[id];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proyecto no encontrado</h1>
          <button 
            onClick={() => navigate('/proyectos')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/proyectos')}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al catálogo
            </button>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {project.name}
              </h1>
              <div className="flex items-center text-lg text-gray-600 mb-6">
                <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {project.location}
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {project.description}
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-sm text-gray-500 mb-2">Apartamentos</div>
                  <div className="text-2xl font-bold text-gray-900">{project.apartments}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-sm text-gray-500 mb-2">Precio desde</div>
                  <div className="text-2xl font-bold text-blue-600">{formatPrice(project.priceFrom)}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Características</h3>
                <div className="grid grid-cols-2 gap-3">
                  {project.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">¿Listo para simular?</h3>
                <p className="text-gray-600 mb-6">
                  Conoce cómo serían tus pagos mensuales para este proyecto con nuestros gráficos interactivos.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowSimulator(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Simular Financiamiento
                  </button>
                  <button 
                    onClick={() => document.getElementById('simulador').scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                  >
                    Ver Gráficos de Pagos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Simulator Modal */}
      {showSimulator && (
        <ProjectSimulator 
          project={project} 
          onClose={() => setShowSimulator(false)} 
        />
      )}
    </>
  );
};

export default ProjectDetailPage;
