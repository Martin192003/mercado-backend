import React, { useEffect, useState } from "react";
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

export function Stock() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    cantidad: 0,
    precio: 0,
    descripcion: "",
    categoria: "",
    imagen_url: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null); // Para el producto seleccionado para edición
  const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error
  const [lowStockAlert, setLowStockAlert] = useState(""); // Estado para la alerta de bajo stock

  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para obtener productos de la base de datos
  const fetchProducts = async () => {
    const { data, error } = await supabase.from("productos").select("*");
    if (error) {
      setErrorMessage("Error al obtener productos: " + error.message);
      return;
    }
    // const sortedStock = data.sort((a, b) => a.categoria.localeCompare(b.categoria));
    setProducts(data);
    // Verificar si algún producto tiene bajo stock
    const lowStock = data.filter((product) => product.cantidad <= 5);
    if (lowStock.length > 0) {
      // Crear un mensaje con los nombres de los productos con bajo stock
      const lowStockNames = lowStock.map((product) => product.nombre).join(", ");
      setLowStockAlert(`¡Alerta! Los siguientes productos tienen bajo stock: ${lowStockNames}`);
    } else {
      setLowStockAlert("");
    }
  };

  // Función para manejar cambios en los campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para manejar cambios en los campos de entrada del modal de edición
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para agregar un nuevo producto
  const handleAddProduct = async () => {
    const {error} = await supabase.from("productos").insert([newProduct]);

    if (error) {
      setErrorMessage("Error al agregar producto: " + error.message);
      return;
    }

    fetchProducts();
    setIsModalOpen(false);
    setNewProduct({
      nombre: "",
      cantidad: 0,
      precio: 0,
      descripcion: "",
      categoria: "",
      imagen_url: "",
    });
  };

  // Función para editar un producto
  const handleEditProduct = async () => {
    const { error } = await supabase
      .from("productos")
      .update(selectedProduct)
      .eq("id", selectedProduct.id);

    if (error) {
      setErrorMessage("Error al editar producto: " + error.message);
      return;
    }

    fetchProducts();
    setIsEditModalOpen(false);
    setSelectedProduct(null); // Limpiar producto seleccionado
  };

  // Función para eliminar un producto
  const handleDeleteProduct = async (id) => {
    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      setErrorMessage("Error al eliminar producto: " + error.message);
      return;
    }

    fetchProducts(); // Actualizar la lista después de eliminar
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Mostrar mensaje de error si existe */}
      {errorMessage && (
        <Alert color="red" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {/* Alerta de bajo stock con los nombres de los productos */}
      {lowStockAlert && (
        <Alert color="yellow" onClose={() => setLowStockAlert("")}>
          {lowStockAlert}
        </Alert>
      )}

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">Gestión de Stock</Typography>
          <Button color="blue" onClick={() => setIsModalOpen(true)} className="text-white">
            Agregar Producto
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Nombre", "Cantidad", "Precio", "Descripción", "Categoría", "Imagen", "Acciones"].map((title) => (
                  <th key={title} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {title}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-3 px-5 border-b">{product.nombre}</td>
                  <td className="py-3 px-5 border-b">{product.cantidad}</td>
                  <td className="py-3 px-5 border-b">{product.precio}</td>
                  <td className="py-3 px-5 border-b">{product.descripcion}</td>
                  <td className="py-3 px-5 border-b">{product.categoria}</td>
                  <td className="py-3 px-5 border-b">
                    <img src={product.imagen_url} alt={product.nombre} className="w-16 h-16 object-cover" />
                  </td>
                  <td className="py-3 px-5 border-b">
                    <div className="flex gap-2">
                      <Button
                        color="green"
                        
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsEditModalOpen(true);
                        }}
                        className="text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        color="red"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-xs"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Modal para agregar producto */}
      <Dialog open={isModalOpen} handler={setIsModalOpen}>
        <DialogHeader>Agregar Nuevo Producto</DialogHeader>
        <DialogBody>
          <div
            className="flex flex-col gap-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddProduct(); // Llama a la función de agregar producto al presionar Enter
              }
            }}
          >
            {[
              ["nombre", "Nombre"],
              ["cantidad", "Cantidad"],
              ["precio", "Precio"],
              ["descripcion", "Descripción"],
              ["categoria", "Categoría"],
              ["imagen_url", "URL de Imagen"],
            ].map(([field, label]) => (
              <Input
                key={field}
                label={label}
                name={field}
                value={newProduct[field]}
                onChange={handleInputChange}
                type={field === "cantidad" || field === "precio" ? "number" : "text"}
              />
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setIsModalOpen(false)} className="mr-2">
            Cancelar
          </Button>
          <Button color="green" onClick={handleAddProduct}>
            Agregar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modal para editar producto */}
      {selectedProduct && (
        <Dialog open={isEditModalOpen} handler={setIsEditModalOpen}>
          <DialogHeader>Editar Producto</DialogHeader>
          <DialogBody>
            <div
              className="flex flex-col gap-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditProduct(); // Llama a la función de editar producto al presionar Enter
                }
              }}
            >
              {[
                ["nombre", "Nombre"],
                ["cantidad", "Cantidad"],
                ["precio", "Precio"],
                ["descripcion", "Descripción"],
                ["categoria", "Categoría"],
                ["imagen_url", "URL de Imagen"],
              ].map(([field, label]) => (
                <Input
                  key={field}
                  label={label}
                  name={field}
                  value={selectedProduct[field]}
                  onChange={handleEditInputChange}
                  type={field === "cantidad" || field === "precio" ? "number" : "text"}
                />
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" color="red" onClick={() => setIsEditModalOpen(false)} className="mr-2">
              Cancelar
            </Button>
            <Button color="green" onClick={handleEditProduct}>
              Guardar
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}

export default Stock;

