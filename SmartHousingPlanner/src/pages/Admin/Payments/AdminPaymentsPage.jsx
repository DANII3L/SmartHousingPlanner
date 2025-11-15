import React, { useCallback, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import { useAuth } from '../../../contexts/AuthContext';
import GenericList from '../../../UI/components/GenericList';
import ProjectCard from '../../Proyectos/components/ProjectCard';
import { useAdminPayments, MONTH_OPTIONS } from '../../../hooks/useAdminPayments';

const AdminPaymentsPage = () => {
  const { isAdmin } = useAuth();
  const {
    firebaseProjects,
    projectsLoading,
    projectError,
    associationsLoading,
    associationsError,
    activeProject,
    activeUsers,
    selectedUser,
    selectedUserId,
    simulationSummary,
    monthlyRequired,
    history,
    hasSimulationForProject,
    totalPaid,
    totalExpected,
    remainingBalance,
    chartData,
    yearOptions,
    formData,
    editingHistoryId,
    feedback,
    isSaving,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    handleSelectUser,
    handleInputChange,
    isAssignModalOpen,
    handleOpenAssignModal,
    handleCloseAssignModal,
    assignProjectId,
    setAssignProjectId,
    documentQuery,
    handleDocumentQueryChange,
    handleSearchUser,
    isSearchingUser,
    foundUser,
    handleAssignUserToProject,
    isAssigningUser,
    assignFeedback,
    assignProject,
    isSimulationLoading,
    simulationError,
    handleEditEntry,
    handleDeleteEntry,
    handleSubmit,
    resetPaymentForm,
  } = useAdminPayments();

  const chartOptions = useMemo(
    () => ({
      backgroundColor: 'transparent',
      legend: { position: 'bottom', textStyle: { color: '#475569', fontSize: 12 } },
      colors: ['#cbd5f5', '#2563eb'],
      hAxis: {
        textStyle: { color: '#475569', fontSize: 12 },
        baselineColor: '#e2e8f0',
        gridlines: { color: '#e2e8f0' },
      },
      vAxis: {
        textStyle: { color: '#475569', fontSize: 12 },
      },
    }),
    [],
  );

  const renderProjectCard = useCallback(
    (project) => (
      <ProjectCard
        key={project.id}
        project={project}
        cardStyle="default"
        detailLabel="Gestionar pagos"
        onDetailClick={() => handleOpenModal(project.id)}
      />
    ),
    [handleOpenModal],
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 text-center">
        <p className="text-lg text-gray-600">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Control de pagos por proyecto
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Proyectos con seguimiento{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">financiero</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Selecciona un proyecto, elige un usuario asociado y registra los pagos mensuales indicando mes, año y el valor abonado.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => handleOpenAssignModal()}
                disabled={!firebaseProjects.length}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Asociar usuarios a proyectos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GenericList
          data={firebaseProjects}
          itemsPerPage={9}
          cardStyle="default"
          renderItem={renderProjectCard}
          searchFields={['name', 'location']}
          searchPlaceholder="Buscar proyectos..."
          loading={projectsLoading}
          error={projectError}
          emptyMessage="No se encontraron proyectos"
          emptySubMessage="Aún no tienes proyectos registrados en Firebase"
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={handleCloseModal} aria-hidden="true" />
          <div className="relative w-full max-w-6xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh]">
            <header className="flex items-start justify-between px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">{activeProject?.location}</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{activeProject?.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Gestiona los pagos registrados por usuario y mantén el historial actualizado.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Cerrar modal"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-136px)]">
              <div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Selecciona un usuario
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(activeProject?.id)}
                    className="rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    Asociar usuarios
                  </button>
                </div>
                {associationsLoading ? (
                  <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    Cargando asociaciones de usuarios...
                  </div>
                ) : associationsError ? (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-600">
                    {associationsError}
                  </div>
                ) : activeUsers.length ? (
                  <select
                    value={selectedUserId ?? ''}
                    onChange={(event) => handleSelectUser(event.target.value || null)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {activeUsers.map((user) => (
                      <option key={user.paymentId} value={user.paymentId}>
                        {user.userName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    Aún no hay usuarios asociados a este proyecto. Usa “Asociar usuarios a proyectos” para vincularlos.
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
                  {isSimulationLoading ? (
                    <p className="text-sm text-slate-500">Cargando datos de la simulación...</p>
                  ) : simulationError ? (
                    <p className="text-sm text-rose-600">{simulationError}</p>
                  ) : simulationSummary ? (
                    <>
                      <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                            Simulación vigente
                          </p>
                          <p className="mt-1 text-3xl font-bold text-blue-600">
                            {formatCurrency(simulationSummary.monthlyPayment)}
                          </p>
                          <p className="text-xs text-slate-500">Cuota mensual estimada</p>
                        </div>
                        <div className="grid gap-3 text-sm text-slate-600">
                          <p className="flex items-center justify-between">
                            <span>Valor total</span>
                            <strong className="text-slate-900">{formatCurrency(simulationSummary.projectValue)}</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Monto a financiar</span>
                            <strong className="text-slate-900">{formatCurrency(simulationSummary.financedAmount)}</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Cuota inicial requerida (30%)</span>
                            <strong className="text-slate-900">{formatCurrency(simulationSummary.downPaymentRequired)}</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Recursos disponibles</span>
                            <strong className="text-emerald-600">{formatCurrency(simulationSummary.availableResources)}</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Subsidio</span>
                            <strong className="text-emerald-600">{formatCurrency(simulationSummary.subsidy)}</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Prima (junio y diciembre)</span>
                            <strong className="text-emerald-600">{formatCurrency(simulationSummary.prima)}</strong>
                          </p>
                        </div>
                        {simulationSummary.createdAt && (
                          <p className="text-xs text-slate-400">
                            Creada: {new Date(simulationSummary.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Resumen financiero
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span>Total pagado</span>
                          <strong className="text-emerald-600">{formatCurrency(totalPaid)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Saldo pendiente</span>
                          <strong className="text-rose-600">{formatCurrency(remainingBalance)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Total a pagar</span>
                          <strong className="text-slate-900">{formatCurrency(simulationSummary.totalToPay || totalExpected)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Total de intereses</span>
                          <strong className="text-slate-900">{formatCurrency(simulationSummary.totalInterests)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Cuota mensual requerida según simulación</span>
                          <strong className="text-slate-900">{formatCurrency(monthlyRequired)}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Aún no hay simulación registrada para este usuario en el proyecto.
                    </p>
                  )}
                </div>
              )}

              {activeUsers.length > 0 && selectedUser ? (
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Gráfico de pagos</h3>
                      {chartData.length > 1 ? (
                        <Chart
                          chartType="ColumnChart"
                          width="100%"
                          height="320px"
                          data={chartData}
                          options={chartOptions}
                          loader={<div>Generando gráfico...</div>}
                        />
                      ) : (
                        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                          Aún no hay historial suficiente para generar el gráfico.
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Historial del usuario</h3>
                          <p className="text-xs text-slate-500">Registros disponibles: {history.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Cuota mensual estimada</p>
                          <p className="text-xl font-bold text-blue-600">{formatCurrency(monthlyRequired)}</p>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {history.length ? (
                          history.map((entry) => (
                            <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {entry.label || new Date(entry.date).toLocaleDateString('es-CO')}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Pagado el{' '}
                                    {entry.date ? new Date(entry.date).toLocaleDateString('es-CO') : 'Sin fecha'}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-blue-300 hover:text-blue-600"
                                    onClick={() => handleEditEntry(entry)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-rose-300 hover:text-rose-600"
                                    onClick={() => handleDeleteEntry(entry)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 flex justify-between text-xs">
                                <span className="text-slate-500">
                                  Requerido:{' '}
                                  <strong className="text-slate-900">{formatCurrency(entry.required || monthlyRequired || 0)}</strong>
                                </span>
                                <span className="text-slate-500">
                                  Pagado:{' '}
                                  <strong className="text-emerald-600">{formatCurrency(entry.actual || 0)}</strong>
                                </span>
                              </div>
                              {entry.notes && <p className="mt-2 text-xs text-slate-500">{entry.notes}</p>}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
                            Este usuario aún no registra pagos para este proyecto.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <form className="rounded-3xl border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
                    <h3 className="text-lg font-semibold text-slate-900">Registrar pago mensual</h3>
                    <p className="text-xs text-slate-500 mb-4">Define mes, año y valor abonado para actualizar el historial.</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mes</label>
                        <select
                          name="month"
                          value={formData.month}
                          onChange={handleInputChange}
                          disabled={!hasSimulationForProject}
                          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {MONTH_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Año</label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          disabled={!hasSimulationForProject}
                          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {yearOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Valor pagado</label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        disabled={!hasSimulationForProject}
                        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        placeholder="1.200.000"
                        min="0"
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Notas (opcional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        disabled={!hasSimulationForProject}
                        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        rows={3}
                        placeholder="Observaciones relevantes..."
                      />
                    </div>

                    {feedback && (
                      <div
                        className={`mt-4 rounded-2xl px-4 py-2 text-xs font-medium ${
                          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {feedback.message}
                      </div>
                    )}

                    <div className="mt-6 flex gap-3">
                      {editingHistoryId && (
                        <button
                          type="button"
                          onClick={resetPaymentForm}
                          className="w-1/3 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSaving || !hasSimulationForProject}
                        className="flex-1 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {isSaving ? 'Guardando...' : editingHistoryId ? 'Actualizar registro' : 'Registrar pago'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center text-sm text-slate-500">
                  Registra y selecciona un usuario para visualizar el historial y registrar pagos.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAssignModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={handleCloseAssignModal} aria-hidden="true" />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh]">
            <header className="flex items-start justify-between px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Asociar usuarios</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Vincular usuario a proyecto</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Busca por documento, elige el proyecto y habilita el seguimiento de pagos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAssignModal}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Cerrar modal de asociación"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[calc(85vh-128px)]">
              {firebaseProjects.length ? (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Proyecto</label>
                    <select
                      value={assignProjectId ?? ''}
                      onChange={(event) => setAssignProjectId(event.target.value || null)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {firebaseProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name} — {project.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Documento del usuario
                      </label>
                      <div className="mt-2 flex flex-wrap gap-3">
                        <input
                          type="text"
                          value={documentQuery}
                          onChange={handleDocumentQueryChange}
                          placeholder="CC / NIT / Identificación"
                          className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <button
                          type="button"
                          onClick={handleSearchUser}
                          disabled={isSearchingUser}
                          className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isSearchingUser ? 'Buscando...' : 'Buscar usuario'}
                        </button>
                      </div>
                    </div>

                    {assignFeedback && (
                      <div
                        className={`rounded-2xl px-4 py-2 text-xs font-medium ${
                          assignFeedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : assignFeedback.type === 'warning'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {assignFeedback.message}
                      </div>
                    )}

                    {foundUser && (
                      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{foundUser.name}</p>
                          <p className="text-xs text-slate-500">{foundUser.email || 'Sin correo registrado'}</p>
                          <p className="text-xs text-slate-500">Documento: {foundUser.document || 'No registrado'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAssignUserToProject}
                          disabled={isAssigningUser}
                          className="rounded-2xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isAssigningUser ? 'Asociando...' : 'Asociar con el proyecto'}
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-500">
                      Los usuarios asociados aparecerán en el modal principal para gestionar sus pagos.
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                  Debes registrar proyectos antes de poder asociar usuarios.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

export default AdminPaymentsPage;
