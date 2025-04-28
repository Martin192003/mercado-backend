import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DialogBody, DialogFooter, Button } from "@material-tailwind/react";

const localizer = momentLocalizer(moment);

const HomeEmpleados = () => {
    const [events, setEvents] = useState([]);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

    const handleSelectSlot = ({ start, end }) => {
        const title = prompt("Ingrese un título para este horario:");
        if (title) {
            setEvents([...events, { start, end, title }]);
        }
    };

    const handleEventChange = (event) => {
        const updatedTitle = prompt("Editar título del horario:", event.title);
        if (updatedTitle) {
            setEvents(
                events.map((e) =>
                    e === event ? { ...e, title: updatedTitle } : e
                )
            );
        }
    };

    const handleSaveSchedules = () => {
        console.log("Horarios guardados:", events);
        setScheduleModalOpen(false);
    };

    return (
        <div>
            <DialogBody>
                <div className="h-96">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleEventChange}
                        style={{ height: "100%" }}
                    />
                </div>
            </DialogBody>
            <DialogFooter>
                <Button
                    variant="text"
                    color="red"
                    onClick={() => setScheduleModalOpen(false)}
                    className="mr-2"
                >
                    Cancelar
                </Button>
                <Button color="green" onClick={handleSaveSchedules}>
                    Guardar Horarios
                </Button>
            </DialogFooter>
        </div>
    );
};

export default HomeEmpleados;