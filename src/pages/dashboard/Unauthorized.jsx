export function Unauthorized() {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <h1 className="text-4xl font-bold">Acceso no autorizado</h1>
        <p>No tienes permiso para acceder a esta página.</p>
      </div>
    );
  }