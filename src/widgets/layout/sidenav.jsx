import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import {
  Button,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController } from "@/context";
import { useUserRole } from "@/hooks/useUserHooks"; // Importar el hook de roles

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const { role, loading } = useUserRole(); // Obtener el rol del usuario

  // Verificación de estado de loading y role
  console.log("Loading:", loading);
  console.log("Role:", role);

  // Si el rol aún no ha sido cargado, mostrar cargando
  if (loading) return <div className="loading">Cargando...</div>;

  // Verificar si las rutas se están pasando correctamente
  console.log("Routes:", routes);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className={`relative`}>
        <Link to="/" className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>
      </div>
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages
              .filter((page) => !page.hidden && page.name?.trim() !== "")
              .filter((page) => page.roles?.includes(role)) // Filtrar por rol
              .map(({ icon, name, path }) => (
                <li key={name}>
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                            ? sidenavColor
                            : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                        }
                        className="flex items-center gap-4 px-4 capitalize"
                        fullWidth
                      >
                        {icon}
                        <Typography color="inherit" className="font-medium capitalize">
                          {name}
                        </Typography>
                      </Button>
                    )}
                  </NavLink>
                </li>
              ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "CoffeeDesk",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;

