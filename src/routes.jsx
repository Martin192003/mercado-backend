import {
  HomeIcon,
  TableCellsIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Home, Empleados, Stock, Autoservicio, Proveedores, HomeEmpleados } from "@/pages/dashboard";
import { SignIn, SignUp, AuthCallback } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Inicio Administrador",
        path: "/home",
        roles: ["admin"], // Roles permitidos
        element: <Home />,
      },
      {
        icon: <HomeIcon {...icon} />,
        name: "Inicio Empleados",
        path: "/homeEmpleados",
        roles: [ "empleado"], // Roles permitidos
        element: <HomeEmpleados />,
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Empleados",
        path: "/Empleados",
        roles: ["admin"], // Solo admin puede acceder
        element: <Empleados />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Stock",
        path: "/Stock",
        roles: ["admin", "empleado"], // Roles permitidos
        element: <Stock />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Proveedores",
        path: "/Proveedores",
        roles: ["admin"], // Solo admin puede acceder
        element: <Proveedores />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Autoservicio",
        path: "/autoservicio",
        roles: ["admin", "empleado"], // Roles permitidos
        element: <Autoservicio />,
      }
    ],
  },
  {
    title: "",
    layout: "auth",
    pages: [
      {
        name: "",
        path: "/sign-in",
        hidden: true,
        element: <SignIn />,
      },
      {
        name: "",
        path: "/sign-up",
        hidden: true,
        element: <SignUp />,
      },
      {
        name: "",
        path: "/auth/callback",
        hidden: true,
        element: <AuthCallback />,
      },
    ],
  },
];

export default routes;
