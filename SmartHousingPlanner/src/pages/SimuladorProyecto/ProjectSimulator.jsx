import React from 'react';
import { useProjectSimulator } from './hooks/useProjectSimulator';

const ProjectSimulator = ({ project, onClose }) => {
  const {
    formData,
    calculation,
    inputError,
    formattedValues,
    formatCurrency,
    getMaxCesantiasPerYear,
    getMaxPrimaPerYear,
    handleInputChange,
    handleCheckboxChange
  } = useProjectSimulator(project);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.60)' }}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Simulador de Financiamiento
              </h2>
              <p className="text-gray-600 mt-2">
                {project?.name} - {project?.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Configura tu Simulación</h3>

              {/* Valor del Proyecto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor del Proyecto
                </label>
                <input
                  type="number"
                  value={formData.projectValue}
                  onChange={(e) => handleInputChange('projectValue', e.target.value)}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Cuota Inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuota Inicial Disponible
                </label>
                <input
                  type="text"
                  placeholder="Ingresa el monto"
                  value={formattedValues.downPayment}
                  onChange={(e) => handleInputChange('downPayment', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                />
                {inputError && (
                  <p className="mt-2 text-sm text-red-600">
                    {inputError}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Máximo: {formatCurrency(formData.projectValue)}
                </p>
              </div>

              {/* Subsidios */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasSubsidy"
                    checked={formData.hasSubsidy}
                    onChange={(e) => handleCheckboxChange('hasSubsidy', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasSubsidy" className="ml-2 text-sm font-medium text-gray-700">
                    Tengo subsidio gubernamental
                  </label>
                </div>
                {formData.hasSubsidy && (
                  <div>
                    <input
                      type="text"
                      placeholder="Ingresa el monto del subsidio"
                      value={formattedValues.subsidyAmount}
                      onChange={(e) => handleInputChange('subsidyAmount', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputError && inputError.includes('subsidio') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {inputError && inputError.includes('subsidio') && (
                      <p className="mt-2 text-sm text-red-600">
                        {inputError}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Máximo: {formatCurrency(formData.projectValue)}
                    </p>
                  </div>
                )}
              </div>

              {/* Cesantías */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasCesantias"
                    checked={formData.hasCesantias}
                    onChange={(e) => handleCheckboxChange('hasCesantias', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasCesantias" className="ml-2 text-sm font-medium text-gray-700">
                    Usar cesantías
                  </label>
                </div>
                {formData.hasCesantias && (
                  <div>
                    <input
                      type="text"
                      placeholder="Ingresa el monto de cesantías"
                      value={formattedValues.cesantiasAmount}
                      onChange={(e) => handleInputChange('cesantiasAmount', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputError && inputError.includes('cesantías') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {inputError && inputError.includes('cesantías') && (
                      <p className="mt-2 text-sm text-red-600">
                        {inputError}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Se aplicará cada mes de marzo durante {formData.creditTerm} años. Máximo: {formatCurrency(getMaxCesantiasPerYear())} por año
                    </p>
                  </div>
                )}
              </div>

              {/* Prima */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasPrima"
                    checked={formData.hasPrima}
                    onChange={(e) => handleCheckboxChange('hasPrima', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasPrima" className="ml-2 text-sm font-medium text-gray-700">
                    Usar prima
                  </label>
                </div>
                {formData.hasPrima && (
                  <div>
                    <input
                      type="text"
                      placeholder="Ingresa el monto de prima"
                      value={formattedValues.primaAmount}
                      onChange={(e) => handleInputChange('primaAmount', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputError && inputError.includes('prima') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {inputError && inputError.includes('prima') && (
                      <p className="mt-2 text-sm text-red-600">
                        {inputError}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Se aplicará cada junio y diciembre durante {formData.creditTerm} años. Máximo: {formatCurrency(getMaxPrimaPerYear())} por pago
                    </p>
                  </div>
                )}
              </div>

              {/* Plazo del crédito */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plazo del crédito (años)
                </label>
                <select
                  value={formData.creditTerm}
                  onChange={(e) => handleInputChange('creditTerm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10 años</option>
                  <option value={15}>15 años</option>
                  <option value={20}>20 años</option>
                  <option value={25}>25 años</option>
                  <option value={30}>30 años</option>
                </select>
              </div>

              {/* Tasa de interés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasa de interés anual (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Resultados */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Resultado de la Simulación</h3>

              {calculation && (
                <div className="space-y-6">
                  {/* Resumen Principal */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatCurrency(calculation.monthlyPayment)}
                      </div>
                      <div className="text-sm text-gray-600">Cuota mensual estimada</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Valor total</div>
                        <div className="font-semibold">{formatCurrency(calculation.projectValue)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Monto a financiar</div>
                        <div className="font-semibold">{formatCurrency(calculation.creditAmount)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles financieros */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Desglose Financiero</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Cuota inicial requerida (30%)</span>
                        <span className="font-medium">{formatCurrency(calculation.requiredDownPayment)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Recursos disponibles</span>
                        <span className="font-medium text-green-600">{formatCurrency(calculation.totalAvailable)}</span>
                      </div>
                      {calculation.subsidyAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Subsidio</span>
                          <span className="font-medium text-blue-600">{formatCurrency(calculation.subsidyAmount)}</span>
                        </div>
                      )}
                      {calculation.cesantiasAmount > 0 && calculation.hasCesantias && (
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-600">Cesantías (cada marzo)</span>
                          <span className="font-medium text-orange-600">{formatCurrency(calculation.totalCesantiasAmount)}</span>
                        </div>
                      )}
                      {calculation.primaAmount > 0 && calculation.hasPrima && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Prima (junio y diciembre)</span>
                          <span className="font-medium text-green-600">{formatCurrency(calculation.totalPrimaAmount)}</span>
                        </div>
                      )}
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-sm">
                        <span>Total de intereses</span>
                        <span className="font-medium">{formatCurrency(calculation.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total a pagar</span>
                        <span>{formatCurrency(calculation.totalPayments)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Consejos */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Consejo Inteligente</h5>
                        <p className="text-sm text-gray-700">
                          {calculation.totalAvailable >= calculation.requiredDownPayment
                            ? calculation.creditAmount === 0 
                              ? "¡Perfecto! Tienes suficientes recursos para pagar el proyecto completo sin necesidad de crédito."
                              : "Excelente! Tienes suficientes recursos para la cuota inicial."
                            : `Necesitas ${formatCurrency(calculation.requiredDownPayment - calculation.totalAvailable)} adicionales para completar la cuota inicial requerida.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Cerrar
            </button>
            <button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200"
            >
              Guardar Simulación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSimulator;
