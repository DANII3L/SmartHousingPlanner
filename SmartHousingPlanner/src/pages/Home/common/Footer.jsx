import React from 'react';
import { Link } from 'react-router-dom';
import { HiHome, HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <HiHome className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">SmartHousing Planner</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Tu guía inteligente para planificar y adquirir vivienda en Colombia. 
              Información sobre subsidios gubernamentales y herramientas de simulación.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">Inicio</Link></li>
              <li><Link to="/proyectos" className="text-gray-400 hover:text-white transition-colors duration-200">Catálogo</Link></li>
              <li><Link to="/simulador" className="text-gray-400 hover:text-white transition-colors duration-200">Simulador</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Subsidios</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Ayuda</a></li>
            </ul>
          </div>


          <div>
            <h3 className="text-lg font-semibold mb-6">Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <HiLocationMarker className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Medellín, Colombia</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <HiPhone className="w-5 h-5 text-blue-500" />
                <p className="text-gray-400">+57 (304) 234-5678</p>
              </div>
              <div className="flex items-center space-x-3">
                <HiMail className="w-5 h-5 text-blue-500" />
                <p className="text-gray-400">info@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 SmartHousing Planner. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Política de Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Términos de Servicio</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
