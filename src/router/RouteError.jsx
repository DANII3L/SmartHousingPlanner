const RouteError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <div className="animate-bounce text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-gray-600 mb-6">
          No pudimos cargar esta sección. Intenta recargar la página o vuelve al inicio.
        </p>
        <a
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold"
          href="/"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
};

export default RouteError;

