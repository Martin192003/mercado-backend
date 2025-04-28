import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserHooks"; // O como lo tengas en tu proyecto

export function ProtectedRoute({ element, roles }) {
  const { role, loading } = useUserRole();

  // Mientras se está cargando el rol, mostramos un loader (opcional)
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Si el rol del usuario no está permitido, redirigir a una página no autorizada
  if (!roles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }

  // Si el rol está permitido, renderizamos el componente
  return element;
}

