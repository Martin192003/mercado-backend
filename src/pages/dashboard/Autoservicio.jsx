import { useState, useEffect } from 'react';
import { supabase } from '/src/supaBaseClient.js';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';

export function Autoservicio() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [qrLink, setQrLink] = useState(null);
  const [isQrReady, setIsQrReady] = useState(false);
  const [isQrScreenVisible, setIsQrScreenVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentCancelled, setIsPaymentCancelled] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const addToCart = (product) => {
    setCart((prev) => {
      const existingProduct = prev.find((item) => item.nombre === product.nombre);
      if (existingProduct) {
        return prev.map((item) =>
          item.nombre === product.nombre
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, cantidad: 1 }];
      }
    });
  };

  const handleShowQrScreen = async () => {
    try {
      const response = await fetch("http://localhost:3001/mercadopago/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      if (!response.ok) {
        throw new Error("Respuesta no OK");
      }
      const data = await response.json();
      console.log("Datos recibidos del backend:", data); // Agrega este log para revisar la respuesta
      setQrLink(data.init_point);
      setIsQrReady(true);
      setIsQrScreenVisible(true);
    } catch (err) {
      console.error("Error al pedir QR:", err);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setIsQrReady(false);
    setQrLink(null);
    setIsQrScreenVisible(false);
    setIsLoading(false);
    setIsPaymentCancelled(false);
    setOrderId(null);
    setCart([]);
  };

  const removeFromCart = (product) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.nombre === product.nombre
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0);
    });
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("productos").select("*");
    if (error) {
      console.error("Error al obtener productos:", error.message);
      return;
    }
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleConfirmOrder = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentWithCard = async () => {
    setIsLoading(true);
    setIsPaymentCancelled(false);

    try {
      const newOrderId = uuidv4();
      const ticketNumber = `TICKET-${Date.now()}`;
      const amount = total;

      if (!newOrderId || !amount || !ticketNumber || amount <= 0) {
        throw new Error("Datos de pago inválidos: orderId, amount o ticketNumber faltan o son inválidos");
      }

      setOrderId(newOrderId);

      console.log('Enviando al backend:', { orderId: newOrderId, amount, ticketNumber });

      const response = await fetch("http://localhost:3001/mercadopagoPoint/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: newOrderId, amount, ticketNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error(errorData.details || "Hay un pago pendiente en el terminal. Por favor, espera unos minutos o cancela manualmente en el dispositivo.");
        }
        throw new Error(errorData.error || "Error al crear el PaymentIntent");
      }

      const data = await response.json();
      console.log("Payment Intent creado:", data);

      setIsLoading(false);
      alert("Pago exitoso");
      handleClosePaymentModal();
    } catch (error) {
      console.error("Error en el pago:", error.message, error);
      setIsLoading(false);
      setIsPaymentCancelled(true);
      alert(`Error en el pago: ${error.message}`);
    }
  };

  const handleCancelOrder = async () => {
    setIsLoading(false);
    setIsPaymentCancelled(true);
    handleClosePaymentModal();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Autoservicio - Café</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Menú</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow">
                <img
                  src={p.foto || "/path/to/default-image.jpg"}
                  alt={p.nombre}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
                <h3 className="text-lg font-medium">{p.nombre}</h3>
                <p className="text-sm text-black-500">{p.categoria}</p>
                <p className="text-sm text-gray-500">{p.descripcion}</p>
                <p className="mt-2 font-semibold">${p.precio}</p>
                <button
                  onClick={() => addToCart(p)}
                  className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-xl"
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Tu pedido</h2>
          <div className="bg-white p-4 rounded-xl shadow">
            {cart.length === 0 ? (
              <p className="text-gray-500">El carrito está vacío.</p>
            ) : (
              <ul className="space-y-2">
                {cart.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {item.nombre}
                      {item.cantidad > 1 ? ` (${item.cantidad})` : ""}
                    </span>
                    <div className="flex gap-2">
                      <span>${item.precio * item.cantidad}</span>
                      <button
                        onClick={() => removeFromCart(item)}
                        className="text-red-500 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t mt-4 pt-2 font-bold flex justify-between">
              <span>Total:</span>
              <span>${total}</span>
            </div>
            <button
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
              disabled={cart.length === 0}
              onClick={handleConfirmOrder}
            >
              Confirmar pedido
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isPaymentModalOpen} handler={handleClosePaymentModal}>
        {isQrScreenVisible ? (
          // Pantalla del QR
          <div className="text-center">
            <DialogHeader>Escanea y paga</DialogHeader>
            <DialogBody>
              {isQrReady && qrLink && (
                <div className="inline-block bg-white p-4 rounded-xl shadow">
                  <QRCode value={qrLink} size={200} />
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                className="bg-red-100"
                variant="text"
                color="red"
                onClick={() => {
                  setIsQrScreenVisible(false); // Volver a la pantalla de botones
                }}
              >
                Volver
              </Button>
            </DialogFooter>
          </div>
        ) : isLoading ? (
          // Pantalla de "Apoye tarjeta"
          <div className="text-center">
            <DialogHeader>Apoye la tarjeta</DialogHeader>
            <DialogBody>
              <p className="text-lg">Por favor, acerque su tarjeta al lector para procesar el pago.</p>
            </DialogBody>
            <DialogFooter>
              <Button
                className="bg-red-100"
                variant="text"
                color="red"
                onClick={handleCancelOrder} // Cancelar el pago
              >
                Cancelar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Pantalla de botones
          <div>
            <DialogHeader>Selecciona tu método de pago</DialogHeader>
            <DialogBody>
              <div className="flex flex-col gap-4">
                <Button
                  color="blue"
                  onClick={handlePaymentWithCard} // Pago con tarjeta
                  className="py-4 text-lg"
                >
                  Pago con tarjeta
                </Button>
                <Button
                  color="blue"
                  onClick={() => alert("Pago en caja seleccionado")}
                  className="py-4 text-lg"
                >
                  En caja
                </Button>
                <Button
                  color="blue"
                  onClick={handleShowQrScreen} // Mostrar QR
                  className="py-4 text-lg"
                >
                  QR
                </Button>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                className="bg-red-100"
                variant="text"
                color="red"
                onClick={handleClosePaymentModal}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default Autoservicio;