import { useState, useEffect } from "react";
import "./Proveedores.css";
import {
  Card,
  Typography,
  Button,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Input,
  List,
  ListItem,
  ListItemPrefix,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { supabase } from "/src/supaBaseClient.js";

export function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [tab, setTab] = useState("resumen");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  // Cargar proveedores al montar el componente
  useEffect(() => {
    async function loadProveedores() {
      const { data, error } = await supabase.from("proveedores").select(`
        *,
        historial_proveedor(*),
        finanzas_proveedor(*),
        productos_proveedor(*),
        facturas_proveedor(*)
      `);
      if (error) {
        console.error("Error al cargar proveedores:", error);
        return;
      }
      setProveedores(data);
      if (data.length > 0) {
        setSelected(data[0]); // Selecciona el primer proveedor por defecto
      }
    }
    loadProveedores();
  }, []);

   // Manejar apertura del modal de edición
   const handleEdit = (section, data) => {
    setEditData({ section, ...data });
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async () => {
    const { section, ...data } = editData;
    try {
      if (section === "resumen") {
        const { nombre, tipo, estado, ultima_compra, frecuencia, total_gastado } = data;
  
        const { error } = await supabase
          .from("proveedores")
          .update({ nombre, tipo, estado, ultima_compra, frecuencia, total_gastado })
          .eq("id", selected.id);
  
        if (error) throw error;
  
        // Actualizar el estado local
        setSelected((prev) => ({
          ...prev,
          nombre,
          tipo,
          estado,
          ultima_compra,
          frecuencia,
          total_gastado,
        }));
      } else if (section === "finanzas") {
        const { deuda, condiciones_pago } = data;
  
        const { error } = await supabase
          .from("finanzas_proveedor")
          .update({ deuda, condiciones_pago })
          .eq("proveedor_id", selected.id);
  
        if (error) throw error;
  
        // Actualizar el estado local
        setSelected((prev) => ({
          ...prev,
          finanzas_proveedor: [{ ...prev.finanzas_proveedor[0], deuda, condiciones_pago }],
        }));
      } else if (section === "contacto") {
        const { contacto_persona, contacto_telefono, contacto_email, contacto_direccion } = data;
  
        const { error } = await supabase
          .from("proveedores")
          .update({ contacto_persona, contacto_telefono, contacto_email, contacto_direccion })
          .eq("id", selected.id);
  
        if (error) throw error;
  
        // Actualizar el estado local
        setSelected((prev) => ({
          ...prev,
          contacto_persona,
          contacto_telefono,
          contacto_email,
          contacto_direccion,
        }));
      } else if (section === "logistica") {
        const { logistica_dias_entrega, logistica_tiempo_entrega, logistica_preferencias } = data;
  
        const { error } = await supabase
          .from("proveedores")
          .update({ logistica_dias_entrega, logistica_tiempo_entrega, logistica_preferencias })
          .eq("id", selected.id);
  
        if (error) throw error;
  
        // Actualizar el estado local
        setSelected((prev) => ({
          ...prev,
          logistica_dias_entrega,
          logistica_tiempo_entrega,
          logistica_preferencias,
        }));
      } else if (section === "productos") {
        const { id, nombre, precio } = data;
  
        const { error } = await supabase
          .from("productos_proveedor")
          .update({ nombre, precio })
          .eq("id", id); // Usar el ID único del producto
  
        if (error) throw error;
  
        // Actualizar el estado local
        setSelected((prev) => ({
          ...prev,
          productos_proveedor: prev.productos_proveedor.map((producto) =>
            producto.id === id ? { ...producto, nombre, precio } : producto
          ),
        }));
      } else if (section === "tabla_finanzas") {
        const { id, numero, fecha, monto, estado } = data;
  
        const { error } = await supabase
          .from("facturas_proveedor")
          .update({ numero, fecha, monto, estado })
          .eq("id", id); // Usar el ID único de la factura
  
        if (error) throw error;
  
        // Actualizar el estado local
        setSelected((prev) => ({
          ...prev,
          facturas_proveedor: prev.facturas_proveedor.map((factura) =>
            factura.id === id ? { ...factura, numero, fecha, monto, estado } : factura
          ),
        }));
      }
  
      setIsEditModalOpen(false); // Cerrar el modal después de guardar
    } catch (error) {
      console.error(`Error al actualizar ${section}:`, error);
    }
  };

  // Tabs para las secciones
  const tabs = [
    { label: "Resumen", value: "resumen" },
    { label: "Historial", value: "historial" },
    { label: "Finanzas", value: "finanzas" },
    { label: "Contacto", value: "contacto" },
    { label: "Logística", value: "logistica" },
    { label: "Productos", value: "productos" },
  ];

  return (
    <div className="p-6 grid gap-6">
      <Typography variant="h4">Proveedores</Typography>
      <div className="flex gap-6">
        
        {/* Lista de proveedores */}
        <div className="w-1/4 space-y-4">
          <Input
            label="Buscar proveedor"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <List className="max-h-[400px] overflow-y-auto">
            {proveedores
              .filter((prov) =>
                prov.nombre.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map((prov, i) => (
                <ListItem
                  key={prov.id}
                  selected={selected?.id === prov.id}
                  onClick={() => setSelected(prov)}
                  className={
                    selected?.id === prov.id
                      ? "list-item-selected"
                      : "list-item-hover"
                  }
                >
                  <ListItemPrefix>
                    <Chip value={prov.estado} size="sm" color="green" />
                  </ListItemPrefix>
                  {prov.nombre}
                </ListItem>
              ))}
          </List>
        </div>

        {/* Detalles del proveedor */}
        <div className="w-3/4">
          <Tabs value={tab} onChange={(val) => setTab(val)}>
            <TabsHeader>
              {tabs.map(({ label, value }) => (
                <Tab key={value} value={value} onClick={() => setTab(value)}>
                  {label}
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody>
              {/* Resumen */}
              <TabPanel value="resumen">
                <Card className="p-4 grid grid-cols-2 gap-4">
                  {selected ? (
                    <>
                      <Typography>
                        <strong>Nombre:</strong> {selected.nombre}
                      </Typography>
                      <Typography>
                        <strong>Tipo:</strong> {selected.tipo}
                      </Typography>
                      <Typography>
                        <strong>Estado:</strong> {selected.estado}
                      </Typography>
                      <Typography>
                        <strong>Última compra:</strong> {selected.ultima_compra}
                      </Typography>
                      <Typography>
                        <strong>Frecuencia:</strong> {selected.frecuencia}
                      </Typography>
                      <Typography>
                        <strong>Total gastado:</strong> ${selected.total_gastado}
                      </Typography>
                      <Button
                        onClick={() => handleEdit("resumen", selected)}
                        className="mt-4"
                      >
                        Editar Resumen
                      </Button>
                    </>                
                  ) : (
                    <Typography>No hay datos disponibles.</Typography>
                  )}
                </Card>
              </TabPanel>

              {/* Historial */}
              <TabPanel value="historial">
                <Card className="p-4">
                  {selected?.historial_proveedor?.length > 0 ? (
                    selected.historial_proveedor.map((h, i) => (
                      <div key={i} className="flex justify-between py-2 border-b">
                        <Typography>{h.fecha}</Typography>
                        <Typography>{h.productos}</Typography>
                        <Typography
                          className={h.estado === "Entregado" ? "text-success" : "text-error"}
                        >
                          {h.estado}
                        </Typography>
                      </div>
                    ))
                  ) : (
                    <Typography>No hay historial disponible.</Typography>
                  )}
                </Card>
              </TabPanel>

              {/* Finanzas */}
              <TabPanel value="finanzas">
                <Card className="p-4 space-y-4">
                {Array.isArray(selected?.finanzas_proveedor) && selected.finanzas_proveedor.length > 0 ? (
                    <>
                    <div className="flex justify-between items-center">
                      <Typography>
                        <strong>Deuda: $</strong> {selected.finanzas_proveedor[0].deuda}
                      </Typography>
                      <Button
                          onClick={() =>
                            handleEdit("finanzas", selected.finanzas_proveedor[0])
                          }
                          className="ml-auto text-sm py-1 px-2 bg-blue-500 text-white rounded"
                        >
                          Editar Finanzas
                        </Button>
                        </div>
                      <Typography>
                        <strong>Condiciones de pago:</strong> {selected.finanzas_proveedor[0].condiciones_pago}
                      </Typography>
                    </>
                  ) : (
                    <Typography>No hay datos financieros disponibles.</Typography>
                  )}
                  {selected?.facturas_proveedor ? (
                    <>
                      <Typography>
                        <strong>Facturas:</strong>
                      </Typography>
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Número</th>
                              <th>Fecha</th>
                              <th>Monto</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.facturas_proveedor?.map((factura, i) => (
                              <tr key={i} className="table-row-hover">
                                <td>{factura.numero}</td>
                                <td>{factura.fecha}</td>
                                <td>${factura.monto}</td>
                                <td
                                  className={
                                    factura.estado === "Pago"
                                      ? "text-success"
                                      : "text-error"
                                  }
                                >
                                  {factura.estado}
                                </td>
                                <td className="text-center align-middle">
                                  <Button
                                    onClick={() => handleEdit("tabla_finanzas", factura)}
                                    className="text-sm py-1 px-2 bg-green-500 text-white rounded"
                                  >
                                    Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <Typography>No hay datos facturas disponibles.</Typography>
                  )}
                </Card>
              </TabPanel>

              {/* Contacto */}
              <TabPanel value="contacto">
                <Card className="p-4 space-y-2">
                  <Typography>
                    <strong>Persona de contacto:</strong>{" "}
                    {selected?.contacto_persona}
                  </Typography>
                  <Typography>
                    <strong>Teléfono:</strong> {selected?.contacto_telefono}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selected?.contacto_email}
                  </Typography>
                  <Typography>
                    <strong>Dirección:</strong> {selected?.contacto_direccion}
                  </Typography>
                  <Button
                    onClick={() => handleEdit("contacto", selected)}
                    className="mt-4"
                  >
                    Editar Contacto
                  </Button>
                </Card>
              </TabPanel>

              {/* Logística */}
              <TabPanel value="logistica">
                <Card className="p-4 space-y-2">
                  <Typography>
                    <strong>Días de entrega:</strong>{" "}
                    {selected?.logistica_dias_entrega}
                  </Typography>
                  <Typography>
                    <strong>Tiempo promedio:</strong>{" "}
                    {selected?.logistica_tiempo_entrega}
                  </Typography>
                  <Typography>
                    <strong>Preferencias:</strong>{" "}
                    {selected?.logistica_preferencias}
                  </Typography>
                  <Button
                    onClick={() => handleEdit("logistica", selected)}
                    className="mt-4"
                  >
                    Editar Logistica
                  </Button>
                </Card>
              </TabPanel>

              {/* Productos */}
              <TabPanel value="productos">
                <Card className="p-4 space-y-2">
                  {selected?.productos_proveedor?.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b py-1"
                    >
                      <div className="flex w-full">
                        <Typography>{p.nombre}</Typography>
                        <Typography className="ml-auto">${p.precio} c/u</Typography>
                      </div>
                      <div className="ml-4">
                        <Button
                          onClick={() =>
                            handleEdit("productos", p)
                          }
                          className="text-sm py-1 px-2 bg-green-500 text-white rounded"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="mt-4">Realizar nuevo pedido</Button>
                  
                </Card>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      </div>

      {/* Modal de edición */}
      <Dialog open={isEditModalOpen} handler={setIsEditModalOpen}>
        <DialogHeader>Editar {editData.section}</DialogHeader>
        <DialogBody>
          {editData.section === "resumen" && (
            <div className="space-y-4">
              <Input
                label="Nombre"
                value={editData.nombre || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, nombre: e.target.value }))
                }
              />
              <Input
                label="Tipo"
                value={editData.tipo || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, tipo: e.target.value }))
                }
              />
            </div>
          )}
          {editData.section === "finanzas" && (
            <div className="space-y-4">
              <Input
                label="Deuda"
                value={editData.deuda || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, deuda: e.target.value }))
                }
              />
              <Input
                label="Condiciones de pago"
                value={editData.condiciones_pago || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    condiciones_pago: e.target.value,
                  }))
                }
              />
            </div>
          )}
          {editData.section === "contacto" && (
            <div className="space-y-4">
              <Input
                label="Persona de contacto"
                value={editData.contacto_persona || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    contacto_persona: e.target.value,
                  }))
                }
              />
              <Input
                label="Teléfono"
                value={editData.contacto_telefono || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    contacto_telefono: e.target.value,
                  }))
                }
              />
              <Input
                label="Email"
                value={editData.contacto_email || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    contacto_email: e.target.value,
                  }))
                }
              />
            </div>
          )}
          {editData.section === "logistica" && (
            <div className="space-y-4">
              <Input
                label="Días de entrega"
                value={editData.logistica_dias_entrega || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    logistica_dias_entrega: e.target.value,
                  }))
                }
              />
              <Input
                label="Tiempo promedio"
                value={editData.logistica_tiempo_entrega || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    logistica_tiempo_entrega: e.target.value,
                  }))
                }
              />
              <Input
                label="Preferencias"
                value={editData.logistica_preferencias || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    logistica_preferencias: e.target.value,
                  }))
                }
              />
              
            </div>
          )}
          {editData.section === "productos" && (
            <div className="space-y-4">
              <Input
                label="Nombre del producto"
                value={editData.nombre || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, nombre: e.target.value }))
                }
              />
              <Input
                label="Precio"
                value={editData.precio || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, precio: e.target.value }))
                }
              />
            </div>
          )}
          {editData.section === "tabla_finanzas" && (
            <div className="space-y-4">
              <Input
                label="Número de factura"
                value={editData.numero || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, numero: e.target.value }))
                }
              />
              <Input
                label="Fecha"
                value={editData.fecha || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, fecha: e.target.value }))
                }
              />
              <Input
                label="Monto"
                value={editData.monto || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, monto: e.target.value }))
                }
              />
              <Input
                label="Estado"
                value={editData.estado || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, estado: e.target.value }))
                }
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsEditModalOpen(false)}
            className="mr-2"
          >
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges}>Guardar</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Proveedores;