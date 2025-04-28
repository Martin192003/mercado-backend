import React, { useState, useEffect } from "react";
import { supabase } from "/src/supaBaseClient.js"; // Asegúrate de importar supabase
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  ordersOverviewData,
} from "@/data";
import { ClockIcon } from "@heroicons/react/24/solid";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from("horarios_empleados")
        .select("*");

      if (error) {
        console.error("Error al obtener horarios:", error.message);
      } else {
        // Aquí para depurar
        console.log("Datos de Supabase:", data); // Verifica los datos que obtienes

        const formattedEvents = data.map((item) => {
          // Verificamos los datos
          console.log("Formateando evento:", item);

          let color = "#3498db"; // Default color (normal)

          // Define colores según el tipo de horario
          if (item.tipo_horario === "nocturno") {
            color = "#9b59b6"; // Morado para nocturno
          } else if (item.tipo_horario === "extra") {
            color = "#e67e22"; // Naranja para extra
          } else if (item.tipo_horario === "otro") {
            color = "#f1c40f"; // Amarillo para otro
          }

          // Crear la fecha correctamente
          const startDate = new Date(item.dia + " " + item.hora_entrada);
          const endDate = new Date(item.dia + " " + item.hora_salida);

          // Verificar las fechas antes de asignarlas
          console.log("Fecha de inicio:", startDate);
          console.log("Fecha de fin:", endDate);

          return {
            title: `${item.empleado_id} (${item.hora_entrada} - ${item.hora_salida}) - ${item.comentarios || "Sin comentarios"}`,
            start: startDate,
            end: endDate,
            color: color, // Color según el tipo de horario
          };
        });

        setEvents(formattedEvents);
      }
      setLoading(false);
    };

    fetchSchedules();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Vista general de pedidos
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {ordersOverviewData.map(
              ({ icon, color, title, description }, key) => (
                <div key={title} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                      key === ordersOverviewData.length - 1
                        ? "after:h-0"
                        : "after:h-4/6"
                    }`}
                  >
                    {React.createElement(icon, {
                      className: `!w-5 !h-5 ${color}`,
                    })}
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      {title}
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {description}
                    </Typography>
                  </div>
                </div>
              )
            )}
          </CardBody>
        </Card>

        {/* Calendario semanal de horarios de empleados */}
        <Card className="border border-blue-gray-100 shadow-sm col-span-2">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Cronograma semanal de empleados
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            <div style={{ height: "500px" }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                style={{ height: "100%", width: "100%" }}
                eventPropGetter={(event) => ({
                  style: { backgroundColor: event.color }, // Usa el color para el fondo
                })}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;

