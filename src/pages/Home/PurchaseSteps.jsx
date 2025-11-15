import React from 'react';

const PurchaseSteps = () => {
  const steps = [
    {
      id: 1,
      title: "Evaluación de Subsidios",
      description: "Te ayudamos a identificar y aplicar a todos los subsidios gubernamentales disponibles como Mi Casa Ya, VIS, y otros beneficios que puedas recibir.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 2,
      title: "Simulación de Pagos",
      description: "Creamos gráficos personalizados mostrando tu plan de pagos ideal, incluyendo cuotas mensuales, plazo recomendado y ahorro con subsidios.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 3,
      title: "Selección de Proyecto",
      description: "En base a tu perfil y subsidios obtenidos, te mostramos los proyectos que mejor se adaptan a tu situación financiera real.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 4,
      title: "Acompañamiento",
      description: "Te guiamos paso a paso en el proceso de compra, desde la inscripción hasta la entrega, con información actualizada de trámites.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <div className="inline-block text-orange-500 font-semibold text-sm tracking-wider uppercase mb-4">
            SOBRE NOSOTROS
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            Tu guía inmobiliaria inteligente
          </h2>
          
          <div className="flex items-center justify-center mb-16">
            <div className="w-px h-12 bg-orange-200"></div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-20 h-px bg-orange-200"></div>
            <div className="w-px h-12 bg-orange-200 mx-4"></div>
            <div className="w-20 h-px bg-orange-200"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Nuestra Historia</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                Somos una startup innovadora que nace con el propósito de democratizar el acceso a la información 
                inmobiliaria en Colombia. Creemos que todos merecen una guía clara para su compra de vivienda.
              </p>
              <p>
                Nuestro equipo combina conocimiento en subsidios gubernamentales, finanzas personales y tecnología 
                para brindarte las herramientas más actualizadas del mercado.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-32 h-32 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-400 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full"></div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Nuestra Visión</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                Queremos ser la plataforma de referencia para la planificación inteligente de vivienda en Colombia, 
                haciendo accesible información sobre subsidios y facilitando decisiones informadas.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Información actualizada sobre subsidios</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Simulaciones de pagos personalizadas</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Guía paso a paso del proceso</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <div className="inline-block text-orange-500 font-semibold text-sm tracking-wider uppercase mb-4">
            PROCESO DE COMPRA
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            Pasos para tu compra correcta
          </h2>
          <div className="flex items-center justify-center">
            <div className="w-px h-12 bg-orange-200"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.id} className="group">
              <div className="relative mb-6">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                />
                <div className="absolute top-4 left-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    {step.icon}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PurchaseSteps;
