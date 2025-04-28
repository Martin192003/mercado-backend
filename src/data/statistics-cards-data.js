import {
  BanknotesIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

export const statisticsCardsData = [
  {
    color: "gray",
    icon: BanknotesIcon,
    title: "Ganancias del día",
    value: "$53k",
    footer: {
      color: "text-green-500",
      value: "+55%",
      label: "más que la semana pasada",
    },
  },
  {
    color: "gray",
    icon: UsersIcon,
    title: "Pedidos hoy",
    value: "2,300",
    footer: {
      color: "text-green-500",
      value: "+3%",
      label: "más que el mes pasado",
    },
  },
  {
    color: "gray",
    icon: UserPlusIcon,
    title: "Productos consumidos",
    value: "3,462",
    footer: {
      color: "text-red-500",
      value: "-2%",
      label: "más que ayer",
    },
  },
  {
    color: "gray",
    icon: ChartBarIcon,
    title: "Ventas",
    value: "$103,430",
    footer: {
      color: "text-green-500",
      value: "+5%",
      label: "más que ayer",
    },
  },
];

export default statisticsCardsData;
