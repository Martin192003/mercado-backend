import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Alert,
} from "@material-tailwind/react";
import { supabase } from "/src/supaBaseClient.js";

export function Empleados() {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    nombre: "",
    apellido: "",
    puesto: "",
    departamento: "",
    email: "",
    dni: "",
    telefono: "",
    direccion: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const tiposHorario = ["normal", "extra", "nocturno", "otro"];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("empleados").select("*");
    if (error) {
      setErrorMessage("Error al obtener empleados: " + error.message);
      return;
    }
    const sortedEmployees = data.sort((a, b) => {
      const nameComparison = a.nombre.localeCompare(b.nombre);
      if( nameComparison !== 0){
        return nameComparison;
      }
      return a.apellido.localeCompare(b.apellido);
    });
    setEmployees(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEmployee = async () => {
    try {
      const { data, error } = await supabase
        .from("empleados")
        .insert([newEmployee])
        .select(); 
  
      if (error) {
        setErrorMessage("Error al insertar empleado: " + error.message);
        return;
      }
  
      if (!data || data.length === 0) {
        setErrorMessage("Error inesperado: no se devolvió el empleado insertado.");
        return;
      }
  
      const empleadoId = data[0].id;
  
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: newEmployee.email,
        password: "holaMedico123", // Cambia esto por una contraseña generada o un input de contraseña
      });
      
      if (authError) {
        setErrorMessage("Error al crear usuario: " + authError.message);
        return;
      }
      
      const user = signUpData?.user;
      
      if (!user) {
        setErrorMessage("Error inesperado: no se devolvió el usuario.");
        return;
      }
      
  
      // Actualizar el empleado con el user_id de Supabase Auth
      const { error: updateError } = await supabase
        .from("empleados")
        .update({ supabase_user_id: user.id })
        .eq("id", empleadoId);
  
      if (updateError) {
        setErrorMessage("Error al vincular el usuario con el empleado: " + updateError.message);
        return;
      }
  
      // Refrescar la lista de empleados
      fetchEmployees();
      setIsModalOpen(false);
      setNewEmployee({
        nombre: "",
        apellido: "",
        puesto: "",
        departamento: "",
        email: "",
        dni: "",
        telefono: "",
        direccion: "",
      });
    } catch (error) {
      setErrorMessage("Error inesperado: " + error.message);
    }
  };
  
  

  const handleEditEmployee = async () => {
    const { error } = await supabase
      .from("empleados")
      .update(selectedEmployee)
      .eq("id", selectedEmployee.id);

    if (error) {
      setErrorMessage("Error al editar empleado: " + error.message);
      return;
    }

    fetchEmployees();
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      // Primero obtenemos el employee desde la base de datos
      const { data: employee, error: getEmployeeError } = await supabase
        .from("empleados")
        .select("supabase_user_id")
        .eq("id", employeeId)
        .single();
  
      if (getEmployeeError || !employee) {
        setErrorMessage("Empleado no encontrado o error al obtener el empleado: " + getEmployeeError?.message);
        return;
      }
  
      const userId = employee.supabase_user_id; // ID de usuario en Supabase Auth
  
      // Eliminar el empleado de la base de datos
      const { error: deleteEmployeeError } = await supabase
        .from("empleados")
        .delete()
        .eq("id", employeeId);
  
      if (deleteEmployeeError) {
        setErrorMessage("Error al eliminar el empleado: " + deleteEmployeeError.message);
        return;
      }
  
      // Eliminar el perfil asociado en la tabla 'profiles'
      const { error: deleteProfileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId); // Usamos el `supabase_user_id` como referencia
  
      if (deleteProfileError) {
        setErrorMessage("Error al eliminar el perfil: " + deleteProfileError.message);
        return;
      }
  
      // Eliminar el usuario de Supabase Auth
      const { error: deleteUserError } = await supabase.auth.api.deleteUser(userId);
  
      if (deleteUserError) {
        setErrorMessage("Error al eliminar el usuario de Supabase Auth: " + deleteUserError.message);
        return;
      }
  
      // Si todo sale bien, refrescar los empleados
      fetchEmployees(); // Refrescar la lista de empleados
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage("Error inesperado: " + error.message);
    }
  };
  

  const openScheduleModal = async (emp) => {
    setSelectedEmpId(emp.id);
    const { data, error } = await supabase
      .from("horarios_empleados")
      .select("*")
      .eq("empleado_id", emp.id);

    if (error) {
      setErrorMessage("Error al obtener horarios: " + error.message);
      return;
    }

    const horariosCompletos = daysOfWeek.map((dia) => {
      const horarioExistente = data.find((h) => h.dia === dia);
      return horarioExistente || {
        dia,
        hora_entrada: "",
        hora_salida: "",
        tipo_horario: "normal",
        comentarios: "",
        activo: true,
      };
    });

    setSelectedSchedules(horariosCompletos);
    setScheduleModalOpen(true);
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...selectedSchedules];
    newSchedules[index][field] = value;
    setSelectedSchedules(newSchedules);
  };

  const handleSaveSchedules = async () => {
    await supabase.from("horarios_empleados").delete().eq("empleado_id", selectedEmpId);

    const nuevos = selectedSchedules.filter(h => h.hora_entrada && h.hora_salida);
    const { error } = await supabase.from("horarios_empleados").insert(
      nuevos.map(h => ({
        ...h,
        empleado_id: selectedEmpId,
        comentarios: h.comentarios || "",
        activo: h.activo ?? true,
        tipo_horario: h.tipo_horario || "normal",
      }))
    );

    if (error) {
      setErrorMessage("Error al guardar horarios: " + error.message);
      return;
    }

    setScheduleModalOpen(false);
    setSelectedSchedules([]);
    setSelectedEmpId(null);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {errorMessage && (
        <Alert color="red" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">Empleados</Typography>
          <Button color="blue" onClick={() => setIsModalOpen(true)} className="text-white">
            Agregar Empleado
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Nombre", "Apellido", "Puesto", "Departamento", "Email", "DNI", "Teléfono", "Dirección", "Acciones"].map((title) => (
                  <th key={title} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {title}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="py-3 px-5 border-b">{emp.nombre}</td>
                  <td className="py-3 px-5 border-b">{emp.apellido}</td>
                  <td className="py-3 px-5 border-b">{emp.puesto}</td>
                  <td className="py-3 px-5 border-b">{emp.departamento}</td>
                  <td className="py-3 px-5 border-b">{emp.email}</td>
                  <td className="py-3 px-5 border-b">{emp.dni}</td>
                  <td className="py-3 px-5 border-b">{emp.telefono}</td>
                  <td className="py-3 px-5 border-b">{emp.direccion}</td>
                  <td className="py-3 px-5 border-b">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        color="green"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsEditModalOpen(true);
                        }}
                        className="text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        color="red"
                        size="sm"
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="text-xs"
                      >
                        Eliminar
                      </Button>
                      <Button
                        color="indigo"
                        size="sm"
                        onClick={() => openScheduleModal(emp)}
                        className="text-xs"
                      >
                        Horarios
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Modal Agregar Empleado */}
      <Dialog open={isModalOpen} handler={setIsModalOpen} portalContainer={document.getElementById("modal-root")} className="max-w-4xl">
        <DialogHeader>Agregar Nuevo Empleado</DialogHeader>
        <DialogBody className="overflow-y-auto max-h-96">
          <div 
            className="flex flex-col gap-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddEmployee(); // Llama a la función de agregar empleado al presionar Enter
              }
            }}
            >
            {[
              ["nombre", "Nombre"],
              ["apellido", "Apellido"],
              ["puesto", "Puesto"],
              ["departamento", "Departamento"],
              ["email", "Email"],
              ["dni", "DNI"],
              ["telefono", "Teléfono"],
              ["direccion", "Dirección"],
            ].map(([field, label]) => (
              <Input
                key={field}
                label={label}
                name={field}
                value={newEmployee[field]}
                onChange={handleInputChange}
              />
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setIsModalOpen(false)} className="mr-2">
            Cancelar
          </Button>
          <Button color="green" onClick={handleAddEmployee}>
            Agregar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modal Editar Empleado */}
      {selectedEmployee && (
        <Dialog open={isEditModalOpen} handler={setIsEditModalOpen} portalContainer={document.getElementById("modal-root")} className="max-w-4xl">
          <DialogHeader>Editar Empleado</DialogHeader>
          <DialogBody className="overflow-y-auto max-h-96">
            <div 
              className="flex flex-col gap-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditEmployee(); // Llama a la función de editar empleado al presionar Enter
                }
              }}
            >
              {[
                ["nombre", "Nombre"],
                ["apellido", "Apellido"],
                ["puesto", "Puesto"],
                ["departamento", "Departamento"],
                ["email", "Email"],
                ["dni", "DNI"],
                ["telefono", "Teléfono"],
                ["direccion", "Dirección"],
              ].map(([field, label]) => (
                <Input
                  key={field}
                  label={label}
                  name={field}
                  value={selectedEmployee[field]}
                  onChange={handleEditInputChange}
                />
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" color="red" onClick={() => setIsEditModalOpen(false)} className="mr-2">
              Cancelar
            </Button>
            <Button color="green" onClick={handleEditEmployee}>
              Guardar
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Modal Horarios */}
      <Dialog open={scheduleModalOpen} handler={setScheduleModalOpen} portalContainer={document.getElementById("modal-root")} className="max-w-4xl">
        <DialogHeader>Horarios del Empleado</DialogHeader>
        <DialogBody className="overflow-y-auto max-h-96">
          <div
            className="flex flex-col gap-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveSchedules(); // Llama a la función de guardar horarios al presionar Enter
              }
            }}
          >
            {selectedSchedules.map((horario, index) => (
              <div key={horario.dia} className="flex gap-4 items-center flex-wrap">
                <Typography className="w-24">{horario.dia}</Typography>

                <input
                  type="time"
                  value={horario.hora_entrada}
                  onChange={(e) => handleScheduleChange(index, "hora_entrada", e.target.value)}
                  className="border p-1 rounded"
                />
                <input
                  type="time"
                  value={horario.hora_salida}
                  onChange={(e) => handleScheduleChange(index, "hora_salida", e.target.value)}
                  className="border p-1 rounded"
                />

                <select
                  value={horario.tipo_horario || "normal"}
                  onChange={(e) => handleScheduleChange(index, "tipo_horario", e.target.value)}
                  className="border p-1 rounded"
                >
                  {tiposHorario.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Comentario"
                  value={horario.comentarios || ""}
                  onChange={(e) => handleScheduleChange(index, "comentarios", e.target.value)}
                  className="border p-1 rounded w-40"
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={horario.activo ?? true}
                    onChange={(e) => handleScheduleChange(index, "activo", e.target.checked)}
                  />
                  Activo
                </label>
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setScheduleModalOpen(false)} className="mr-2">
            Cancelar
          </Button>
          <Button color="green" onClick={handleSaveSchedules}>
            Guardar Horarios
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Empleados;

